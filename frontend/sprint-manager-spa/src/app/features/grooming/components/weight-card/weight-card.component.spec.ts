import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WeightCardComponent } from './weight-card.component';

describe('WeightCardComponent', () => {
  let fixture: ComponentFixture<WeightCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeightCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(WeightCardComponent);
    fixture.componentRef.setInput('card', {
      id: 1,
      weightValue: 8,
      timeScore: 3,
      timeLabel: 'Long Fix',
      estimatedTime: '3 - 4 days',
      element: 'Fire',
      line: 'This one brings heat.'
    });
    fixture.detectChanges();
  });

  it('renders the weight card content', () => {
    expect(fixture.nativeElement.textContent).toContain('Long Fix');
    expect(fixture.nativeElement.textContent).toContain('8');
  });
});
