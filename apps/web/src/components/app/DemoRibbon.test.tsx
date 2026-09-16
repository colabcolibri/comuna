import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DemoRibbon } from './DemoRibbon';

describe('DemoRibbon', () => {
  it('keeps the banner and a link to the other surface', () => {
    render(
      <DemoRibbon
        label="Isto é uma demonstração. Os dados não mudam."
        href="http://localhost:3015"
        linkLabel="Abrir o admin"
      />
    );
    expect(screen.getByRole('status').className).toMatch(/shrink-0/);
    expect(screen.getByRole('status').className).not.toMatch(/sticky/);
    expect(screen.getByRole('link', { name: 'Abrir o admin' }).getAttribute('href')).toBe(
      'http://localhost:3015'
    );
  });
});
