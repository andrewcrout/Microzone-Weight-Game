import { GroomingStateService } from './grooming-state.service';

describe('GroomingStateService', () => {
  it('stores lobby updates locally', () => {
    const service = new GroomingStateService();

    service.setLobby({ sessionId: 1, canStart: false, participants: [] });

    expect(service.lobby()?.sessionId).toBe(1);
  });

  it('updates the current user vote inside the revealed results', () => {
    const service = new GroomingStateService();

    service['pendingReveal'] = {
      ticketId: 10,
      votes: [
        { userId: 1, displayName: 'Dev One', weightValue: 1 },
        { userId: 2, displayName: 'Dev Two', weightValue: 3 }
      ],
      isTie: true,
      majorityWeight: null
    };
    service['revealState'].set(service['pendingReveal']);

    service.updateRevealedVote(1, 3);

    expect(service.reveal()?.votes.find((vote) => vote.userId === 1)?.weightValue).toBe(3);
    expect(service.reveal()?.majorityWeight).toBe(3);
    expect(service.reveal()?.isTie).toBeFalse();
  });
});
