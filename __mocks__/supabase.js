export const supabase = {
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user: { id: 'user123' } },
      error: null,
    }),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockResolvedValue({
      data: [
        {
          id: 'meal1',
          user_id: 'user123',
          name: 'Omelette',
          calories: 250,
          meal_type: 'breakfast',
          created_at: new Date().toISOString(),
        },
        {
          id: 'meal2',
          user_id: 'user123',
          name: 'Salade',
          calories: 150,
          meal_type: 'lunch',
          created_at: new Date().toISOString(),
        },
      ],
      error: null,
    }),
  })),
};
