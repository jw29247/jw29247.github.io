import type { FinanceState, WeddingBudgetItem, WeddingContribution } from '../types';
import WeddingPlanner from '../components/finance/WeddingPlanner';
import '../styles/ui.css';
import '../styles/finance-page.css';

type WeddingPageProps = {
  plan: FinanceState['wedding'];
  onPlanChange: (updates: Partial<FinanceState['wedding']>) => void;
  onAddContribution: (contribution: Omit<WeddingContribution, 'id'>) => void;
  onRemoveContribution: (id: string) => void;
  onAddBudgetItem: (item: Omit<WeddingBudgetItem, 'id'>) => void;
  onUpdateBudgetItem: (id: string, updates: Partial<WeddingBudgetItem>) => void;
  onRemoveBudgetItem: (id: string) => void;
};

export function WeddingPage({
  plan,
  onPlanChange,
  onAddContribution,
  onRemoveContribution,
  onAddBudgetItem,
  onUpdateBudgetItem,
  onRemoveBudgetItem,
}: WeddingPageProps) {
  return (
    <section className="page">
      <WeddingPlanner
        plan={plan}
        onPlanChange={onPlanChange}
        onAddContribution={onAddContribution}
        onRemoveContribution={onRemoveContribution}
        onAddBudgetItem={onAddBudgetItem}
        onUpdateBudgetItem={onUpdateBudgetItem}
        onRemoveBudgetItem={onRemoveBudgetItem}
      />
    </section>
  );
}

export default WeddingPage;
