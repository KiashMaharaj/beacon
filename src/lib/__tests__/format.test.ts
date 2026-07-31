import { speciesLabel, sizeLabel } from '../format';

describe('format', () => {
  it('labels species', () => {
    expect(speciesLabel('dog')).toBe('Dog');
    expect(speciesLabel('cat')).toBe('Cat');
    expect(speciesLabel('other')).toBe('Other pet');
  });

  it('capitalises sizes and handles empty', () => {
    expect(sizeLabel('small')).toBe('Small');
    expect(sizeLabel(null)).toBe('');
    expect(sizeLabel(undefined)).toBe('');
  });
});
