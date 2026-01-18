import { render, screen } from '@testing-library/react';
import BugCard from '@/components/BugCard';
import { BugReport } from '@/lib/types';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

const mockBug: BugReport = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Login button not working',
  description: 'The login button does not respond to clicks on the homepage.',
  steps_to_reproduce: '1. Go to homepage\n2. Click login button',
  expected_result: 'Login modal opens',
  actual_result: 'Nothing happens',
  severity: 'high',
  severity_display: 'High',
  status: 'open',
  status_display: 'Open',
  environment: 'Windows 11 / Chrome 121',
  tags: ['ui', 'button', 'login'],
  created_by: {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
  },
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T12:45:00Z',
};

describe('BugCard', () => {
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    mockOnDelete.mockClear();
  });

  it('renders bug title', () => {
    render(<BugCard bug={mockBug} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('Login button not working')).toBeInTheDocument();
  });

  it('renders bug description', () => {
    render(<BugCard bug={mockBug} onDelete={mockOnDelete} />);
    
    expect(screen.getByText(/The login button does not respond/)).toBeInTheDocument();
  });

  it('renders severity badge', () => {
    render(<BugCard bug={mockBug} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('renders status badge', () => {
    render(<BugCard bug={mockBug} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('renders tags', () => {
    render(<BugCard bug={mockBug} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('ui')).toBeInTheDocument();
    expect(screen.getByText('button')).toBeInTheDocument();
    expect(screen.getByText('login')).toBeInTheDocument();
  });

  it('renders view link with correct href', () => {
    render(<BugCard bug={mockBug} onDelete={mockOnDelete} />);
    
    const viewLink = screen.getByRole('link', { name: /view/i });
    expect(viewLink).toHaveAttribute('href', `/bugs/${mockBug.id}`);
  });

  it('renders title link with correct href', () => {
    render(<BugCard bug={mockBug} onDelete={mockOnDelete} />);
    
    const titleLink = screen.getByRole('link', { name: mockBug.title });
    expect(titleLink).toHaveAttribute('href', `/bugs/${mockBug.id}`);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<BugCard bug={mockBug} onDelete={mockOnDelete} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    deleteButton.click();
    
    expect(mockOnDelete).toHaveBeenCalledWith(mockBug.id);
  });

  it('shows +N for tags when there are more than 3', () => {
    const bugWithManyTags: BugReport = {
      ...mockBug,
      tags: ['ui', 'button', 'login', 'critical', 'frontend'],
    };
    
    render(<BugCard bug={bugWithManyTags} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('renders different severity colors', () => {
    const criticalBug: BugReport = { ...mockBug, severity: 'critical', severity_display: 'Critical' };
    const { rerender } = render(<BugCard bug={criticalBug} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('Critical')).toHaveClass('bg-red-100');
    
    const lowBug: BugReport = { ...mockBug, severity: 'low', severity_display: 'Low' };
    rerender(<BugCard bug={lowBug} onDelete={mockOnDelete} />);
    
    expect(screen.getByText('Low')).toHaveClass('bg-green-100');
  });
});
