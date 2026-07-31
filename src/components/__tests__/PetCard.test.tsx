import { render, screen } from '@testing-library/react';
import { PetCard } from '@/components/pets/PetCard';
import type { PetReport } from '@/lib/types';

const missing: PetReport = {
  id: 'r1',
  reporterId: 'u',
  kind: 'missing',
  status: 'active',
  name: 'Biscuit',
  species: 'dog',
  breed: 'Retriever',
  colour: 'Golden',
  contactPref: 'in_app',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastSeenAt: new Date().toISOString(),
  location: { lat: 51.5, lng: -0.12, label: 'Riverside Park' },
  distanceKm: 1.2,
};

describe('PetCard', () => {
  it('renders the pet name, status and links to detail', () => {
    render(<PetCard report={missing} />);
    expect(screen.getByText('Biscuit')).toBeInTheDocument();
    expect(screen.getByText('Missing')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/pets/r1');
  });

  it('shows the distance badge when known', () => {
    render(<PetCard report={missing} />);
    expect(screen.getByText('1.2 km away')).toBeInTheDocument();
  });

  it('falls back to a generated title for unnamed found pets', () => {
    render(<PetCard report={{ ...missing, id: 'r2', name: null, kind: 'found' }} />);
    expect(screen.getByText('Found dog')).toBeInTheDocument();
  });
});
