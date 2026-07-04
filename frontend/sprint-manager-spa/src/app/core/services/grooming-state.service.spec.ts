import { GroomingStateService } from './grooming-state.service';

describe('GroomingStateService', () => {
  it('stores lobby updates locally', () => {
    const service = new GroomingStateService();

    service.setLobby({ sessionId: 1, canStart: false, participants: [] });

    expect(service.lobby()?.sessionId).toBe(1);
  });
});
