import { Result } from '../index';

test('Result', () => {
    expect(Result.success().isSuccess).toBe(true);
});