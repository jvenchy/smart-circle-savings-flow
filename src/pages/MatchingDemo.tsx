import React, { useState } from 'react';

// --- ICONS (Included for self-containment) ---
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ZapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;


// --- TYPES (From your circleMatchingAlgorithm.ts) ---
interface SpendingPattern {
  category: 'budget-conscious' | 'organic-focused' | 'bulk-buyer' | 'premium' | 'convenience' | 'family-oriented' | 'health-focused';
  frequency: number;
  average_amount: number;
  last_updated: Date;
}

interface UserWithSpendingProfile {
  id: string;
  email: string;
  full_name: string;
  postal_code: string;
  life_stage: string;
  shopping_frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  spending_patterns: SpendingPattern[];
}

interface CircleWithMembers {
  id: string;
  name: string;
  description: string;
  members: UserWithSpendingProfile[];
}

// --- SAMPLE DATA FOR DEMO ---
const sampleUnmatchedUsers: UserWithSpendingProfile[] = [
  { id: 'u1', full_name: 'Alice Johnson', email: 'alice@demo.com', postal_code: 'M5V 2T6', life_stage: 'young_professionals', shopping_frequency: 'weekly', spending_patterns: [{ category: 'budget-conscious', frequency: 0.8, average_amount: 80, last_updated: new Date() }, { category: 'convenience', frequency: 0.6, average_amount: 30, last_updated: new Date() }] },
  { id: 'u2', full_name: 'Ben Carter', email: 'ben@demo.com', postal_code: 'M5V 1J4', life_stage: 'young_professionals', shopping_frequency: 'weekly', spending_patterns: [{ category: 'budget-conscious', frequency: 0.7, average_amount: 95, last_updated: new Date() }] },
  { id: 'u3', full_name: 'Cathy Williams', email: 'cathy@demo.com', postal_code: 'M4K 1N8', life_stage: 'families_with_young_children', shopping_frequency: 'bi-weekly', spending_patterns: [{ category: 'family-oriented', frequency: 0.9, average_amount: 250, last_updated: new Date() }, { category: 'bulk-buyer', frequency: 0.7, average_amount: 150, last_updated: new Date() }] },
  { id: 'u4', full_name: 'David Miller', email: 'david@demo.com', postal_code: 'M4K 2L7', life_stage: 'families_with_young_children', shopping_frequency: 'weekly', spending_patterns: [{ category: 'family-oriented', frequency: 0.8, average_amount: 220, last_updated: new Date() }] },
  { id: 'u5', full_name: 'Eva Green', email: 'eva@demo.com', postal_code: 'M6K 3C3', life_stage: 'students', shopping_frequency: 'monthly', spending_patterns: [{ category: 'budget-conscious', frequency: 0.9, average_amount: 60, last_updated: new Date() }] },
  { id: 'u6', full_name: 'Frank Davis', email: 'frank@demo.com', postal_code: 'M5V 3L9', life_stage: 'young_professionals', shopping_frequency: 'daily', spending_patterns: [{ category: 'premium', frequency: 0.5, average_amount: 120, last_updated: new Date() }, { category: 'convenience', frequency: 0.9, average_amount: 40, last_updated: new Date() }] },
  { id: 'u7', full_name: 'Grace Lee', email: 'grace@demo.com', postal_code: 'M4K 1A1', life_stage: 'families_with_young_children', shopping_frequency: 'weekly', spending_patterns: [{ category: 'organic-focused', frequency: 0.6, average_amount: 180, last_updated: new Date() }, { category: 'family-oriented', frequency: 0.7, average_amount: 200, last_updated: new Date() }] },
];


// --- COMPONENT ---
const MatchingDemo = () => {
    const [users, setUsers] = useState<UserWithSpendingProfile[]>(sampleUnmatchedUsers);
    const [circles, setCircles] = useState<CircleWithMembers[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isMatched, setIsMatched] = useState(false);

    const formatLifeStage = (stage: string) => stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const getPostalArea = (postal: string) => postal.substring(0, 3);

    const handleRunMatching = () => {
        setIsLoading(true);
        // Simulate the async matching process
        setTimeout(() => {
            // Simplified matching logic for demo purposes
            const userGroups = users.reduce((acc, user) => {
                const key = `${getPostalArea(user.postal_code)}-${user.life_stage}`;
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(user);
                return acc;
            }, {} as Record<string, UserWithSpendingProfile[]>);

            const newCircles: CircleWithMembers[] = Object.entries(userGroups)
                .filter(([, members]) => members.length >= 2) // Only form circles with 2+ members
                .map(([key, members], index) => {
                    const [area, lifeStage] = key.split('-');
                    return {
                        id: `circle-${index + 1}`,
                        name: `${area} - ${formatLifeStage(lifeStage)}`,
                        description: `A community of ${members.length} members in the ${area} area.`,
                        members,
                    };
                });
            
            const matchedUserIds = new Set(newCircles.flatMap(c => c.members.map(m => m.id)));
            const remainingUsers = users.filter(u => !matchedUserIds.has(u.id));

            setCircles(newCircles);
            setUsers(remainingUsers);
            setIsLoading(false);
            setIsMatched(true);
        }, 2500); // Simulate a 2.5 second process
    };

    const handleReset = () => {
        setUsers(sampleUnmatchedUsers);
        setCircles([]);
        setIsMatched(false);
    };

    const UserCard = ({ user }: { user: UserWithSpendingProfile }) => (
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105">
            <h4 className="font-bold text-gray-800">{user.full_name}</h4>
            <p className="text-sm text-gray-600">{user.postal_code}</p>
            <p className="text-sm text-orange-600 font-medium mt-1">{formatLifeStage(user.life_stage)}</p>
            <div className="mt-2 flex flex-wrap gap-1">
                {user.spending_patterns.map(p => (
                    <span key={p.category} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{p.category}</span>
                ))}
            </div>
        </div>
    );
    
    const CircleCard = ({ circle }: { circle: CircleWithMembers }) => (
        <div className="bg-white/80 backdrop-blur-sm border border-orange-200 rounded-2xl p-6 shadow-lg transition-all duration-500 animate-fade-in-up">
            <h3 className="text-xl font-bold text-orange-600">{circle.name}</h3>
            <p className="text-gray-600 mb-4">{circle.description}</p>
            <div className="space-y-3">
                {circle.members.map(member => (
                    <div key={member.id} className="bg-orange-50 p-3 rounded-lg flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                            {member.full_name[0]}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">{member.full_name}</p>
                            <p className="text-xs text-gray-500">{member.postal_code}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Circle Matching Algorithm</h2>
                <p className="text-lg text-gray-600 mt-2">Visualize how we group users into effective saving circles.</p>
            </div>

            <div className="flex justify-center mb-8">
                {!isMatched && !isLoading && (
                     <button onClick={handleRunMatching} className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform duration-300">
                        <ZapIcon />
                        Run Matching Algorithm
                    </button>
                )}
                 {isLoading && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500"></div>
                        <p className="text-gray-600 text-lg animate-pulse">Finding the best circles for everyone...</p>
                    </div>
                 )}
                 {isMatched && (
                    <button onClick={handleReset} className="bg-gray-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-800 transition-colors duration-300">
                        Reset Demo
                    </button>
                )}
            </div>
            
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Unmatched Users / Remaining Users */}
                <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-gray-700">{isMatched ? "Unmatched Users" : "Users Ready for Matching"}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {users.map(user => <UserCard key={user.id} user={user} />)}
                        {isMatched && users.length === 0 && (
                            <div className="md:col-span-2 text-center py-10 bg-white/60 rounded-xl">
                                <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
                                <p className="mt-2 text-lg font-medium text-gray-700">Great! All users were successfully matched.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Matched Circles */}
                <div className="space-y-4">
                     <h3 className="text-2xl font-semibold text-gray-700">New Matched Circles</h3>
                     {isMatched && circles.length > 0 && (
                        <div className="space-y-6">
                            {circles.map(circle => <CircleCard key={circle.id} circle={circle}/>)}
                        </div>
                     )}
                     {!isMatched && (
                         <div className="text-center py-20 bg-gray-500/10 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
                            <UsersIcon className="h-12 w-12 text-gray-400 mb-2"/>
                            <p className="text-gray-500">Circles will appear here after running the algorithm.</p>
                         </div>
                     )}
                </div>
            </div>
        </div>
    );
};

export default MatchingDemo;
