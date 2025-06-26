import React, { useState } from 'react';

// --- ICONS (Included for self-containment) ---
const ZapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;


// --- TYPES (From your classificationService.ts) ---
interface UserClassification {
  primary_stage: string;
  secondary_stages: string[];
  confidence_score: number;
  reasoning: string;
}

// --- SAMPLE DATA FOR DEMO ---
const sampleTransactions = `Transaction: Loblaws, Amount: $124.50, Category: Groceries, Date: 2025-06-24
Transaction: Shoppers Drug Mart, Amount: $45.20, Category: Health, Items: Baby Formula, Diapers, Date: 2025-06-23
Transaction: Indigo, Amount: $29.99, Category: Books, Items: "The Very Hungry Caterpillar", Date: 2025-06-22
Transaction: Mastermind Toys, Amount: $89.95, Category: Toys, Date: 2025-06-22
Transaction: NoFrills, Amount: $88.76, Category: Groceries, Date: 2025-06-17
Transaction: Shoppers Drug Mart, Amount: $32.10, Category: Health, Items: Baby Tylenol, Date: 2025-06-15
Transaction: Pizzeria Libretto, Amount: $75.00, Category: Restaurant, Date: 2025-06-14
Transaction: Loblaws, Amount: $150.32, Category: Groceries, Bulk items, Date: 2025-06-10`;

// --- COMPONENT ---
const TransactionClassification = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<UserClassification | null>(null);
    const [summary, setSummary] = useState('');

    const formatLifeStage = (stage: string) => stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const handleClassification = () => {
        setIsLoading(true);
        setResult(null);
        setSummary('');

        // Simulate API call for summary
        setTimeout(() => {
            setSummary("User makes frequent, large grocery purchases at Loblaws and NoFrills, often buying items like baby formula, diapers, and children's toys. Spending indicates a family-focused household, likely with young children. They are also budget-conscious, shopping at discount grocery stores.");
        }, 1500);

        // Simulate API call for classification
        setTimeout(() => {
            setResult({
                primary_stage: 'families_with_young_children',
                secondary_stages: ['budget-conscious', 'bulk-buyer'],
                confidence_score: 0.92,
                reasoning: "High frequency of purchases for baby-related items (formula, diapers, toys) strongly indicates the presence of young children. Grocery shopping patterns show large basket sizes, typical for families. Choice of both Loblaws and NoFrills suggests a mix of quality and budget-consciousness."
            });
            setIsLoading(false);
        }, 3000);
    };

    const handleReset = () => {
        setResult(null);
        setSummary('');
        setIsLoading(false);
    };
    
    const ConfidenceMeter = ({ score }: { score: number }) => (
        <div>
            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${score * 100}%` }}
                />
            </div>
            <p className="text-right text-sm font-bold text-blue-600 mt-1">{(score * 100).toFixed(0)}% Confidence</p>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Transaction Classification Engine</h2>
                <p className="text-lg text-gray-600 mt-2">See how our AI analyzes transaction data to determine a user's life stage.</p>
            </div>
            
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                 {/* Input */}
                 <div className="bg-white/60 backdrop-blur-sm border rounded-2xl p-6 shadow-lg">
                    <h3 className="font-bold text-xl text-gray-800 mb-4">1. Raw Transaction Data</h3>
                    <div className="bg-gray-800 text-white p-4 rounded-lg font-mono text-xs max-h-80 overflow-y-auto">
                        <pre><code>{sampleTransactions}</code></pre>
                    </div>

                    <div className="mt-6 flex justify-center">
                    {!result && !isLoading && (
                         <button onClick={handleClassification} className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform duration-300">
                            <ZapIcon />
                            Classify User Profile
                        </button>
                    )}
                    {isLoading && (
                        <div className="flex items-center gap-4 text-lg">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                            <p className="text-gray-600 animate-pulse">AI is thinking...</p>
                        </div>
                    )}
                    {result && (
                        <button onClick={handleReset} className="bg-gray-700 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-gray-800 transition-colors duration-300">
                            Reset Demo
                        </button>
                    )}
                    </div>
                </div>

                {/* Output */}
                <div className="space-y-6">
                    {/* Summary */}
                    <div className={`transition-all duration-500 ${summary ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="bg-white/60 backdrop-blur-sm border rounded-2xl p-6 shadow-lg animate-fade-in-up">
                             <h3 className="font-bold text-xl text-gray-800 mb-2">2. AI-Generated Summary</h3>
                             <p className="text-gray-700 italic">
                                {summary || "Summary will appear here..."}
                             </p>
                        </div>
                    </div>
                    {/* Classification */}
                     <div className={`transition-all duration-500 ${result ? 'opacity-100' : 'opacity-0'}`}>
                        {result && (
                            <div className="bg-white/60 backdrop-blur-sm border-2 border-green-300 rounded-2xl p-6 shadow-2xl animate-fade-in-up" style={{animationDelay: '200ms'}}>
                                <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2"><CheckCircleIcon className="text-green-500"/> 3. Classification Result</h3>
                                
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500">Primary Life Stage</p>
                                    <p className="text-2xl font-bold text-green-600">{formatLifeStage(result.primary_stage)}</p>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-500">Secondary Traits</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {result.secondary_stages.map(stage => (
                                            <span key={stage} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">{formatLifeStage(stage)}</span>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500 mb-2">Confidence</p>
                                    <ConfidenceMeter score={result.confidence_score} />
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">AI Reasoning</p>
                                    <p className="text-gray-700 text-sm mt-1">{result.reasoning}</p>
                                </div>
                            </div>
                        )}
                    </div>
                     {isLoading && !result && (
                        <div className="text-center py-20 bg-gray-500/10 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
                            <p className="text-gray-500">Results will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransactionClassification;

