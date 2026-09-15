import { render, screen, waitFor } from '@testing-library/react';
import { OpsHtmlPreview } from './ops-html-preview';

describe('OpsHtmlPreview', () => {
  it('paints html into a stable iframe without swapping srcdoc', async () => {
    const { rerender } = render(<OpsHtmlPreview title="Pré-visualização" html="<p>um</p>" />);
    const frame = screen.getByTitle('Pré-visualização') as HTMLIFrameElement;
    expect(frame.getAttribute('srcdoc')).toBeNull();
    await waitFor(() => {
      const text = frame.contentDocument?.body?.textContent || frame.getAttribute('srcdoc') || '';
      expect(text).toContain('um');
    });
    rerender(<OpsHtmlPreview title="Pré-visualização" html="<p>dois</p>" />);
    await waitFor(() => {
      const text = frame.contentDocument?.body?.textContent || frame.getAttribute('srcdoc') || '';
      expect(text).toContain('dois');
    });
    expect(frame.getAttribute('srcdoc')).toBeNull();
  });
});
