import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/lib/stores/useUserStore';

export default function TestSimplifiedSystem() {
  const { user, isAuthenticated } = useUserStore();
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testDirectQuery = async () => {
    setLoading(true);
    setTestResult('Testing direct Supabase query...\n');
    
    try {
      // Test 1: Simple query
      const startTime = Date.now();
      const { data, error } = await supabase
        .from('exrcwiki')
        .select('exercise_id, name')
        .limit(5);
      
      const queryTime = Date.now() - startTime;
      
      if (error) {
        setTestResult(prev => prev + `❌ Query failed: ${error.message}\n`);
      } else {
        setTestResult(prev => prev + `✅ Query succeeded in ${queryTime}ms\n`);
        setTestResult(prev => prev + `   Found ${data?.length || 0} exercises\n`);
      }
      
      // Test 2: Auth check
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        setTestResult(prev => prev + `✅ Auth working: ${session.session.user.email}\n`);
      } else {
        setTestResult(prev => prev + `⚠️ No active session\n`);
      }
      
    } catch (err) {
      setTestResult(prev => prev + `❌ Unexpected error: ${err}\n`);
    } finally {
      setLoading(false);
    }
  };

  const testMultipleQueries = async () => {
    setLoading(true);
    setTestResult('Testing multiple queries...\n');
    
    try {
      // Run 5 queries in parallel
      const promises = Array.from({ length: 5 }, (_, i) => 
        supabase
          .from('exrcwiki')
          .select('exercise_id')
          .eq('muscle_group', ['chest', 'shoulders', 'back', 'legs', 'arms'][i])
          .limit(1)
      );
      
      const startTime = Date.now();
      const results = await Promise.all(promises);
      const queryTime = Date.now() - startTime;
      
      const successful = results.filter(r => !r.error).length;
      const failed = results.filter(r => r.error).length;
      
      setTestResult(prev => prev + `Completed in ${queryTime}ms\n`);
      setTestResult(prev => prev + `✅ Successful: ${successful}\n`);
      if (failed > 0) {
        setTestResult(prev => prev + `❌ Failed: ${failed}\n`);
      }
      
    } catch (err) {
      setTestResult(prev => prev + `❌ Error: ${err}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Simplified System Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <p>Auth Status: {isAuthenticated ? '✅ Authenticated' : '❌ Not authenticated'}</p>
        <p>User: {user?.email || 'None'}</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testDirectQuery} 
          disabled={loading}
          style={{ marginRight: '10px', padding: '10px' }}
        >
          Test Direct Query
        </button>
        
        <button 
          onClick={testMultipleQueries} 
          disabled={loading}
          style={{ padding: '10px' }}
        >
          Test Multiple Queries
        </button>
      </div>
      
      <pre style={{ 
        background: '#f0f0f0', 
        padding: '10px', 
        borderRadius: '5px',
        whiteSpace: 'pre-wrap'
      }}>
        {testResult || 'Click a button to test...'}
      </pre>
    </div>
  );
}