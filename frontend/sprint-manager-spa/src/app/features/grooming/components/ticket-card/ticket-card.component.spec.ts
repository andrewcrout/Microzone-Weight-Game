import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketCardComponent } from './ticket-card.component';

describe('TicketCardComponent', () => {
  let fixture: ComponentFixture<TicketCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TicketCardComponent);
    fixture.componentRef.setInput('ticket', {
      id: 1,
      trelloCardId: '1',
      title: 'Demo ticket',
      description: 'Hello **world**',
      shortUrl: 'https://trello',
      systemName: 'PROMAN GENERAL',
      commentCount: 2,
      weightValue: 4,
      timeScore: 2,
      groomingStatus: 'Pending',
      workStatus: 'NotStarted',
      labels: ['Sprint'],
      assignees: ['Dev'],
      comments: ['Looks good']
    });
    fixture.componentRef.setInput('comments', ['Looks good']);
    fixture.detectChanges();
  });

  it('renders title and weight', () => {
    expect(fixture.nativeElement.textContent).toContain('Demo ticket');
    expect(fixture.nativeElement.textContent).toContain('Weight: 4');
  });
});
