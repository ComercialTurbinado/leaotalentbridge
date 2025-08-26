'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService, User as UserType } from '@/lib/auth';
import DashboardHeader from '@/components/DashboardHeader';
import { GrGroup, GrSearch, GrFilter, GrAdd, GrEdit, GrTrash, GrView, GrMail, GrPhone, GrCalendar, GrLocation, GrBriefcase, GrOrganization, GrMore, GrStatusGood, GrStatusCritical, GrClock, GrStatusWarning, GrClose, GrUser, GrStar } from 'react-icons/gr';
import styles from './candidatos.module.css';

interface Candidato {
  _id: string;
  name: string;
  email: string;
  type: 'candidato';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  profile?: {
    phone?: string;
    avatar?: string;
    company?: string;
    position?: string;
    linkedin?: string;
    website?: string;
    experience?: string;
    skills?: string[];
    education?: string;
    languages?: Array<{
      language: string;
      level: string;
    }>;
  };
  permissions?: {
    canAccessJobs: boolean;
    canApplyToJobs: boolean;
    canViewCourses: boolean;
    canAccessSimulations: boolean;
    canContactCompanies: boolean;
  };
  profileVerified?: boolean;
  documentsVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCandidatosPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [filtroStatus, setFiltroStatus] = useState('all');
  const [busca, setBusca] = useState('');
  const [candidatoSelecionado, setCandidatoSelecionado] = useState<Candidato | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'create' | 'delete'>('view');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    type: 'candidato' as 'candidato',
    status: 'approved' as 'pending' | 'approved' | 'rejected' | 'suspended',
    tempPassword: '',
    profile: {
      phone: '',
      company: '',
      position: '',
      linkedin: '',
      website: '',
      experience: '',
      skills: [] as string[],
      education: '',
      languages: [] as Array<{ language: string; level: string }>
    },
    permissions: {
      canAccessJobs: false,
      canApplyToJobs: false,
      canViewCourses: true,
      canAccessSimulations: false,
      canContactCompanies: false
    },
    profileVerified: false,
    documentsVerified: false
  });

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser || currentUser.type !== 'admin') {
      router.push('/admin/login');
      return;
    }
    setUser(currentUser);
    loadCandidatos();
  }, [router, currentPage, filtroStatus, busca]);

  const loadCandidatos = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        type: 'candidato',
        ...(filtroStatus !== 'all' && { status: filtroStatus }),
        ...(busca && { search: busca })
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCandidatos(data.data);
        setTotalPages(data.pagination.pages);
      } else {
        console.error('Erro ao carregar candidatos');
      }
    } catch (error) {
      console.error('Erro ao carregar candidatos:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filtroStatus, busca]);

  // Placeholder para o resto da implementação
  return (
    <div className={styles.candidatosPage}>
      <DashboardHeader user={user} userType="admin" />
      <main className={styles.mainContent}>
        <div className="container">
          <div className={styles.pageHeader}>
            <div className={styles.titleSection}>
              <h1>Gestão de Candidatos</h1>
              <p>Gerencie todos os candidatos cadastrados na plataforma Leão Talent Bridge</p>
            </div>
          </div>
          <p>Página em construção...</p>
        </div>
      </main>
    </div>
  );
}
