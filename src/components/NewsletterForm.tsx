import { StationForm } from './site/StationForm';

export function NewsletterForm({ variant: _variant }: { variant?: string }) {
  void _variant;
  return <StationForm mode="newsletter" />;
}
