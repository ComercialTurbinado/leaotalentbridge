import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiService } from '@/lib/api';

interface UseApiDataOptions {
  endpoint: string;
  method: 'getJobs' | 'getApplications' | 'getCompanies' | 'getUsers';
  params?: any;
  dependencies?: any[];
  debounceMs?: number;
  autoLoad?: boolean;
  fields?: string;
}

interface UseApiDataReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  currentPage: number;
  loadMore: () => void;
  refresh: () => void;
  search: (query: string) => void;
  clearSearch: () => void;
}

export function useApiData<T = any>({
  endpoint,
  method,
  params = {},
  dependencies = [],
  debounceMs = 300,
  autoLoad = true,
  fields
}: UseApiDataOptions): UseApiDataReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadRef = useRef(false);

  // Função debounced para busca
  const debouncedSearch = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      setSearchQuery(query);
      setCurrentPage(1);
      setData([]);
    }, debounceMs);
  }, [debounceMs]);

  // Função para carregar dados
  const loadData = useCallback(async (page: number = 1, reset: boolean = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      const queryParams = {
        ...params,
        page,
        limit: 20,
        ...(searchQuery && { search: searchQuery }),
        ...(fields && { fields })
      };

      let response: any;
      
      switch (method) {
        case 'getJobs':
          response = await ApiService.getJobs(queryParams);
          break;
        case 'getApplications':
          response = await ApiService.getApplications(queryParams);
          break;
        case 'getCompanies':
          response = await ApiService.getCompanies(queryParams);
          break;
        case 'getUsers':
          response = await ApiService.getUsers(queryParams);
          break;
        default:
          throw new Error(`Método ${method} não suportado`);
      }

      const newData = response.data || [];
      const total = response.total || newData.length;
      
      if (reset || page === 1) {
        setData(newData);
      } else {
        setData(prev => [...prev, ...newData]);
      }
      
      setTotalCount(total);
      setHasMore(newData.length === 20 && data.length + newData.length < total);
      setCurrentPage(page);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      console.error(`Erro ao carregar ${endpoint}:`, err);
    } finally {
      setLoading(false);
    }
  }, [method, params, searchQuery, fields, endpoint, loading, data.length]);

  // Carregar mais dados (paginação)
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadData(currentPage + 1, false);
    }
  }, [loadData, loading, hasMore, currentPage]);

  // Refresh dos dados
  const refresh = useCallback(() => {
    setCurrentPage(1);
    setData([]);
    loadData(1, true);
  }, [loadData]);

  // Busca com debounce
  const search = useCallback((query: string) => {
    debouncedSearch(query);
  }, [debouncedSearch]);

  // Limpar busca
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setCurrentPage(1);
    setData([]);
  }, []);

  // Efeito para carregar dados inicial
  useEffect(() => {
    if (autoLoad && !initialLoadRef.current) {
      initialLoadRef.current = true;
      loadData(1, true);
    }
  }, [loadData, autoLoad]);

  // Efeito para recarregar quando busca muda
  useEffect(() => {
    if (searchQuery !== '') {
      loadData(1, true);
    }
  }, [searchQuery, loadData]);

  // Efeito para dependências
  useEffect(() => {
    if (dependencies && dependencies.length > 0) {
      loadData(1, true);
    }
  }, [loadData, dependencies]);

  // Cleanup do debounce
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    hasMore,
    totalCount,
    currentPage,
    loadMore,
    refresh,
    search,
    clearSearch
  };
}

// Hook específico para vagas com otimizações
export function useJobs(params?: any) {
  return useApiData({
    endpoint: '/jobs',
    method: 'getJobs',
    params,
    fields: 'title,companyId.name,location,salary,workType,publishedAt,status,tags'
  });
}

// Hook específico para candidaturas com otimizações  
export function useApplications(params?: any) {
  return useApiData({
    endpoint: '/applications',
    method: 'getApplications', 
    params,
    fields: 'userId.name,userId.email,jobId.title,jobId.companyId.name,status,appliedAt,score'
  });
}

// Hook específico para empresas com otimizações
export function useCompanies(params?: any) {
  return useApiData({
    endpoint: '/companies',
    method: 'getCompanies',
    params,
    fields: 'name,industry,size,location,verified,status'
  });
}

// Hook específico para usuários com otimizações
export function useUsers(params?: any) {
  return useApiData({
    endpoint: '/users',
    method: 'getUsers',
    params,
    fields: 'name,email,type,address.city,address.state,professionalInfo.summary'
  });
} 