import supabase from './supabaseClient';

interface Transaction {
  id: string;
  user_id: string;
  transaction_id: string;
  timestamp: string;
  product_name: string;
  category: string;
  quantity: number;
  price: number;
  store_id: string;
  life_stage?: string;
  created_at: string;
  updated_at: string;
}

export async function summarizeUserTransactions(
  userId: string,
  days: number
): Promise<string | null> {
  try {
    // Calculate the date threshold for filtering
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    const isoDateThreshold = dateThreshold.toISOString();

    // Fetch transactions for the user within the specified date range
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', isoDateThreshold)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Supabase query error details:', JSON.stringify(error, null, 2));
      throw new Error(`Failed to fetch transactions: ${error.message}`);
    }

    // Handle case where no transactions are found
    if (!transactions || transactions.length === 0) {
      return null;
    }

    const typedTransactions = transactions as Transaction[];

    // Calculate total spending (price * quantity for each line item)
    const totalSpending = typedTransactions.reduce((sum, transaction) => sum + (transaction.price * transaction.quantity), 0);

    // Calculate spending by category
    const categorySpending = typedTransactions.reduce((acc, transaction) => {
      const itemTotal = transaction.price * transaction.quantity;
      acc[transaction.category] = (acc[transaction.category] || 0) + itemTotal;
      return acc;
    }, {} as Record<string, number>);

    // Calculate category percentages and sort by spending
    const categoryPercentages = Object.entries(categorySpending)
      .map(([category, amount]) => ({
        category,
        percentage: Math.round((amount / totalSpending) * 100)
      }))
      .sort((a, b) => b.percentage - a.percentage);

    // Count product frequency
    const productFrequency = typedTransactions.reduce((acc, transaction) => {
      acc[transaction.product_name] = (acc[transaction.product_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get top 5 most frequently purchased products
    const topProducts = Object.entries(productFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([product]) => product);

    // Format the summary string
    const totalTransactions = typedTransactions.length;
    
    // Get top 2 categories for the summary
    const topCategories = categoryPercentages.slice(0, 2);
    const categoriesText = topCategories
      .map(({ category, percentage }) => `${category} (${percentage}% of spend)`)
      .join(', ');

    // Get top 3 products for the summary
    const notableProducts = topProducts.slice(0, 3).join(', ');

    const summary = `User has made ${totalTransactions} line-item purchases in the last ${days} days. Key categories purchased: ${categoriesText}. Notable products: ${notableProducts}.`;

    return summary;

  } catch (error) {
    console.error('Error summarizing user transactions:', error);
    throw error;
  }
} 