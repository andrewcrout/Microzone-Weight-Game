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
      description: '1. Issue\n\nHello **world**',
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

  it('renders ticket content on the front and comments on the back', () => {
    expect(fixture.nativeElement.querySelector('.weight-box strong')?.textContent.trim()).toBe('4');
    expect(fixture.nativeElement.querySelector('.time-box strong')?.textContent.trim()).toBe('2');
    expect(fixture.nativeElement.querySelector('.comment-badge')?.textContent.trim()).toBe('1');
    expect(fixture.nativeElement.querySelector('.title-bar')?.textContent.trim()).toBe('Demo ticket');
    expect(fixture.nativeElement.querySelector('.labels-panel')?.textContent.trim()).toBe('Sprint');
    expect(fixture.nativeElement.querySelector('.description-copy')?.textContent).toContain('Issue');
    expect(fixture.nativeElement.querySelector('.comments-panel')?.textContent).toContain('Looks good');
  });

  it('opens the full ticket detail dialog', () => {
    fixture.nativeElement.querySelector<HTMLButtonElement>('.ticket-view-button')?.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.ticket-modal')?.textContent).toContain('Demo ticket');
    expect(fixture.nativeElement.querySelector('.ticket-modal')?.textContent).toContain('Sprint');
    expect(fixture.nativeElement.querySelector('.ticket-modal')?.textContent).toContain('Looks good');

    fixture.nativeElement.querySelector<HTMLButtonElement>('.ticket-modal-close')?.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.ticket-modal')).toBeNull();
  });
});
