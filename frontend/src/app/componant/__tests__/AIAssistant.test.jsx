import { describe, expect, it } from 'vitest';
import { validateCvData, validateLetterData, parseCvContent } from '../AIAssistant';

describe('AIAssistant helpers', () => {
  it('returns validation errors for invalid CV data', () => {
    const result = validateCvData({
      name: 'A',
      email: 'invalid-email',
      phone: '',
      title: 'A',
      experience: 'short',
      skills: 'a',
      education: 'x',
    });

    expect(result).toEqual({
      name: 'Nom complet doit contenir au moins 2 caracteres.',
      email: 'Veuillez saisir une adresse e-mail valide.',
      title: 'Titre professionnel doit contenir au moins 2 caracteres.',
      experience: 'Experience professionnelle doit contenir au moins 10 caracteres.',
      skills: 'Competences doit contenir au moins 2 caracteres.',
      education: 'Formation doit contenir au moins 2 caracteres.',
    });
  });

  it('returns validation errors for invalid letter data', () => {
    const result = validateLetterData({
      company: 'A',
      position: 'A',
      motivation: 'trop cour',
    });

    expect(result).toMatchObject({
      company: 'Nom de l\'entreprise doit contenir au moins 2 caracteres.',
      position: 'Poste vise doit contenir au moins 2 caracteres.',
      motivation: 'Motivation doit contenir au moins 10 caracteres.',
    });
  });

  it('parses CV content into header and sections', () => {
    const content = `Jean Dupont\nDéveloppeur\nEmail: jean@test.com\nTéléphone: 06 12 34 56 78\n\nExpérience:\n- Développement frontend\n- Refonte produit\n\nCompétences:\nReact, Node.js`;
    const parsed = parseCvContent(content);

    expect(parsed.header.name).toBe('Jean Dupont');
    expect(parsed.header.title).toBe('Développeur');
    expect(parsed.header.email).toBe('jean@test.com');
    expect(parsed.header.phone).toBe('06 12 34 56 78');
    expect(parsed.sections['Expérience']).toEqual(['- Développement frontend', '- Refonte produit']);
    expect(parsed.sections['Compétences']).toEqual(['React, Node.js']);
  });
});
