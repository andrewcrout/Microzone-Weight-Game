import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VoteRevealComponent } from './vote-reveal.component';

describe('VoteRevealComponent', () => {
  let fixture: ComponentFixture<VoteRevealComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoteRevealComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(VoteRevealComponent);
    fixture.componentRef.setInput('reveal', {
      ticketId: 10,
      votes: [
        { userId: 1, displayName: 'Current Dev', weightValue: 5 },
        { userId: 2, displayName: 'Other Dev', weightValue: 3 }
      ],
      isTie: false,
      majorityWeight: 5
    });
    fixture.componentRef.setInput('currentUserId', 1);
    fixture.detectChanges();
  });

  it('renders the current user vote as a clickable control', () => {
    const ownVoteButton = fixture.nativeElement.querySelector('.own-vote');

    expect(ownVoteButton?.textContent).toContain('Current Dev');
    expect(ownVoteButton?.textContent).toContain('Click to change your vote');
  });
});
