describe('DiceBear Avatar API', () => {
  const avatarUrl = 'https://api.dicebear.com/6.x/adventurer/svg?seed=TestUser';

  test('fetches an SVG avatar successfully', async () => {
    const response = await fetch(avatarUrl);
    expect(response.ok).toBe(true);
    const svg = await response.text();
    expect(svg.startsWith('<svg')).toBe(true);
    // The seed value is used to generate the avatar but is not included in the SVG content
    // Instead, just verify we've received valid SVG content
    expect(svg.includes('</svg>')).toBe(true);
  });
});