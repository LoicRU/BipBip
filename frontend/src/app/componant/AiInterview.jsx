import { useEffect, useRef, useState } from "react";
import { X, Mic, MicOff, Send, Bot, User, CheckCircle, RefreshCw } from "lucide-react";
import {
  evaluateAiInterview,
  generateAiInterviewQuestions,
} from "../services/api";

function normalizeQuestions(value) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(normalizeQuestions);
  }

  if (value && typeof value === "object") {
    return Object.entries(value)
      .sort(([left], [right]) => {
        const leftMatch = left.match(/(\d+)$/);
        const rightMatch = right.match(/(\d+)$/);

        if (!leftMatch || !rightMatch) {
          return left.localeCompare(right);
        }

        return Number(leftMatch[1]) - Number(rightMatch[1]);
      })
      .flatMap(([, nestedValue]) => normalizeQuestions(nestedValue));
  }

  return [];
}

export function AiInterview({ isOpen, onClose, job, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);
  const transcriptBufferRef = useRef("");
  const SpeechRecognition =
    typeof window !== "undefined"
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  useEffect(() => {
    if (!isOpen || !job) {
      return;
    }

    let cancelled = false;

    const bootstrapInterview = async () => {
      setCurrentQuestion(0);
      setAnswers([]);
      setCurrentAnswer("");
      setIsCompleted(false);
      setError("");
      setIsRecording(false);

      const presetQuestions = normalizeQuestions(job.aiQuestions);

      if (presetQuestions.length > 0) {
        setQuestions(presetQuestions);
        return;
      }

      setLoadingQuestions(true);

      try {
        const result = await generateAiInterviewQuestions({
          title: job.title,
          description: job.description || "Description non disponible",
          requirements: Array.isArray(job.requirements) ? job.requirements : [],
          experience: job.experience || "",
          company: job.company || "",
          type: job.type || "",
        });

        if (!cancelled) {
          setQuestions(normalizeQuestions(result.questions));
        }
      } catch (requestError) {
        if (!cancelled) {
          setQuestions([]);
          setError(requestError.message || "Impossible de préparer l'entretien IA");
        }
      } finally {
        if (!cancelled) {
          setLoadingQuestions(false);
        }
      }
    };

    bootstrapInterview();

    return () => {
      cancelled = true;
    };
  }, [isOpen, job]);

  useEffect(() => {
    if (!isOpen) {
      recognitionRef.current?.stop?.();
      setIsRecording(false);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop?.();
    };
  }, []);

  if (!isOpen || !job) return null;

  const toggleRecording = () => {
    if (!SpeechRecognition) {
      setError("La reconnaissance vocale n'est pas prise en charge sur ce navigateur.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop?.();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "fr-FR";
    recognition.continuous = true;
    recognition.interimResults = true;

    transcriptBufferRef.current = currentAnswer.trim();

    recognition.onstart = () => {
      setError("");
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      const liveTranscript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ")
        .trim();
      const transcript = [transcriptBufferRef.current, liveTranscript]
        .filter(Boolean)
        .join(" ")
        .trim();

      setCurrentAnswer(transcript);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      setError("Impossible d'utiliser le micro pour cette reponse.");
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setIsRecording(false);
      transcriptBufferRef.current = "";
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleNext = async () => {
    if (!currentAnswer.trim()) {
      return;
    }

    recognitionRef.current?.stop?.();
    setIsRecording(false);

    const nextAnswers = [
      ...answers,
      {
        question: questions[currentQuestion],
        answer: currentAnswer.trim(),
        timestamp: new Date().toISOString(),
      },
    ];

    setAnswers(nextAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setCurrentAnswer("");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const evaluation = await evaluateAiInterview({
        jobId: job.id,
        title: job.title,
        description: job.description || "Description non disponible",
        requirements: Array.isArray(job.requirements) ? job.requirements : [],
        answers: nextAnswers,
      });

      const result = {
        jobId: job.id,
        answers: nextAnswers,
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths || [],
        weaknesses: evaluation.weaknesses || [],
        summary: evaluation.summary || "",
        provider: evaluation.provider || "fallback",
        completedAt: new Date().toISOString(),
      };

      setIsCompleted(true);
      onComplete?.(result);
    } catch (requestError) {
      setError(requestError.message || "Impossible d'évaluer l'entretien");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleNext();
    }
  };

  if (isCompleted) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="max-w-2xl w-full rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Entretien terminé !
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Votre entretien IA a été évalué par le backend et sera joint à la candidature.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="max-w-4xl w-full rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Entretien IA - {job.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {loadingQuestions
                  ? "Préparation des questions..."
                  : `Question ${Math.min(currentQuestion + 1, Math.max(questions.length, 1))} sur ${Math.max(
                      questions.length,
                      1
                    )}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {loadingQuestions ? (
            <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/20 p-8 text-center">
              <RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin mb-4" />
              <p className="text-gray-700 dark:text-gray-300">
                Le backend prépare les questions d'entretien...
              </p>
            </div>
          ) : error && questions.length === 0 ? (
            <div className="rounded-2xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 p-6 text-center text-red-700 dark:text-red-300">
              {error}
            </div>
          ) : (
            <>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestion + 1) / Math.max(questions.length, 1)) * 100}%`,
                  }}
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Question {currentQuestion + 1}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                      {questions[currentQuestion]}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Votre réponse
                  </span>
                </div>

                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Tapez votre réponse ici..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  autoFocus
                />

                {error && (
                  <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Appuyez sur Entrée pour continuer</span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={toggleRecording}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                        isRecording
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      {isRecording ? "Arrêter" : "Enregistrer"}
                    </button>

                    <button
                      onClick={() => void handleNext()}
                      disabled={!currentAnswer.trim() || submitting}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {submitting ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {submitting
                        ? "Évaluation..."
                        : currentQuestion < questions.length - 1
                          ? "Suivant"
                          : "Terminer"}
                    </button>
                  </div>
                </div>
              </div>

              {answers.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Questions précédentes ({answers.length})
                  </h4>
                  <div className="space-y-2">
                    {answers.map((answer, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Question {index + 1} répondue</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
