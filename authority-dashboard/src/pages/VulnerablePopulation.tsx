import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { VulnerablePerson, RiskAssessmentResult } from '../types';
import {
  Search,
  Filter,
  CheckCircle,
  Eye,
  FileText,
  AlertCircle,
  Phone,
  Home,
  Heart,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';

export const VulnerablePopulation: React.FC = () => {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [selectedPerson, setSelectedPerson] = useState<VulnerablePerson | null>(null);
  const [explanationData, setExplanationData] = useState<RiskAssessmentResult | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isExplainOpen, setIsExplainOpen] = useState(false);

  const { data: persons = [], isLoading } = useQuery({
    queryKey: ['vulnerable-persons-list'],
    queryFn: () => apiService.getVulnerablePersons(),
  });

  const verifyMutation = useMutation({
    mutationFn: (id: number) => apiService.verifyVulnerablePerson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vulnerable-persons-list'] });
      alert('Individual profile verified successfully.');
    },
  });

  const handleOpenExplain = async (person: VulnerablePerson) => {
    setSelectedPerson(person);
    const explanation = await apiService.getRiskAssessmentExplanation(person.id);
    setExplanationData(explanation);
    setIsExplainOpen(true);
  };

  const handleOpenDetail = (person: VulnerablePerson) => {
    setSelectedPerson(person);
    setIsDetailOpen(true);
  };

  // Filter logic
  const filtered = persons.filter((p) => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nationalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'ALL' || p.vulnerabilityCategory === categoryFilter;

    const matchesRisk = riskFilter === 'ALL' || p.currentRiskLevel === riskFilter;

    const matchesStatus =
      statusFilter === 'ALL' || p.verificationStatus === statusFilter;

    return matchesSearch && matchesCategory && matchesRisk && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-navy-900 tracking-tight">
            Vulnerable Population Register
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Targeted registry for high-risk citizens, children, elderly, and medical dependents
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, National ID, address..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg outline-none focus:ring-1 focus:ring-navy-800"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none bg-slate-50 text-navy-900 font-medium"
          >
            <option value="ALL">All Categories</option>
            <option value="ELDERLY">Elderly (65+)</option>
            <option value="CHILD">Children / Infants</option>
            <option value="DISABILITY">Disability</option>
            <option value="PREGNANT">Pregnant Women</option>
            <option value="MEDICAL_ASSISTANCE">Medical Assistance</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => {
              setRiskFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none bg-slate-50 text-navy-900 font-medium"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="HIGH">High Risk (≥ 75)</option>
            <option value="MEDIUM">Medium Risk (45-74)</option>
            <option value="LOW">Low Risk (&lt; 45)</option>
          </select>

          {/* Verification Status */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs border border-slate-300 rounded-lg outline-none bg-slate-50 text-navy-900 font-medium"
          >
            <option value="ALL">All Verification Statuses</option>
            <option value="VERIFIED">Verified</option>
            <option value="PENDING">Pending Review</option>
          </select>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">Citizen ID & Name</th>
                <th className="px-5 py-3">Category & Age</th>
                <th className="px-5 py-3">Mobility Status</th>
                <th className="px-5 py-3">Composite Risk</th>
                <th className="px-5 py-3">Emergency Contact</th>
                <th className="px-5 py-3">Verification</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    Loading records from Spring Boot backend...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    No individuals matched your filter criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((person) => (
                  <tr key={person.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-navy-900">{person.fullName}</div>
                      <div className="font-mono text-[10px] text-slate-400">
                        {person.nationalId}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-800">
                        {person.vulnerabilityCategory}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {person.age} years • {person.gender}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs">{person.mobilityStatus}</span>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                        {person.medicalConditions}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-2">
                        <StatusBadge type="risk" value={person.currentRiskLevel} size="sm" />
                        <span className="font-mono font-bold text-slate-700">
                          {person.currentRiskScore}
                        </span>
                      </div>
                      <button
                        onClick={() => handleOpenExplain(person)}
                        className="text-[10px] text-navy-800 hover:underline flex items-center space-x-1 mt-1 font-semibold"
                      >
                        <Info className="w-3 h-3 text-amber-600" />
                        <span>Explain Score</span>
                      </button>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-800">
                        {person.emergencyContactName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {person.emergencyContactPhone} ({person.emergencyContactRelationship})
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      {person.verificationStatus === 'VERIFIED' ? (
                        <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          VERIFIED
                        </span>
                      ) : (
                        <button
                          onClick={() => verifyMutation.mutate(person.id)}
                          className="inline-flex items-center text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-200 transition"
                        >
                          Verify Now
                        </button>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenDetail(person)}
                        className="p-1.5 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded transition"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong>{Math.min(currentPage * pageSize, filtered.length)}</strong> of{' '}
            <strong>{filtered.length}</strong> entries
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-mono font-bold">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedPerson && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Profile: ${selectedPerson.fullName} (${selectedPerson.nationalId})`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Demographics</span>
                <p className="font-bold text-sm text-navy-900 mt-0.5">{selectedPerson.fullName}</p>
                <p className="text-slate-600">{selectedPerson.age} yrs • {selectedPerson.gender} • DOB: {selectedPerson.dateOfBirth}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Risk Assessment</span>
                <div className="flex items-center space-x-2 mt-1">
                  <StatusBadge type="risk" value={selectedPerson.currentRiskLevel} />
                  <span className="font-mono font-bold text-sm text-navy-900">Score: {selectedPerson.currentRiskScore}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
              <span className="font-bold text-red-950 uppercase text-[10px] tracking-wider">
                Medical Diagnosis & Equipment Needs
              </span>
              <p className="text-red-900 mt-1 leading-relaxed">{selectedPerson.medicalConditions}</p>
            </div>

            <div>
              <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                Assistance Requirements
              </span>
              <p className="text-slate-800 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                {selectedPerson.assistanceRequirements}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                  Residential Location
                </span>
                <p className="text-slate-800 mt-1">{selectedPerson.address}</p>
                <p className="font-mono text-[11px] text-slate-400 mt-0.5">
                  Lat: {selectedPerson.latitude.toFixed(4)}, Lon: {selectedPerson.longitude.toFixed(4)}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                  Authorized Emergency Contact
                </span>
                <p className="text-slate-800 font-bold mt-1">
                  {selectedPerson.emergencyContactName} ({selectedPerson.emergencyContactRelationship})
                </p>
                <p className="font-mono text-emerald-700 font-bold mt-0.5">
                  {selectedPerson.emergencyContactPhone}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Transparent Risk Assessment Score Explanation Drawer */}
      {explanationData && (
        <Modal
          isOpen={isExplainOpen}
          onClose={() => setIsExplainOpen(false)}
          title={`Transparent Risk Calculation: ${explanationData.personName}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Total Vulnerability Score</span>
                <div className="text-2xl font-extrabold text-navy-900">{explanationData.totalScore} / 100</div>
              </div>
              <StatusBadge type="risk" value={explanationData.riskLevel} size="lg" />
            </div>

            <div>
              <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px] mb-2">
                Active Contributing Scoring Rules
              </h4>
              <div className="space-y-2">
                {explanationData.contributingFactors.map((f, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-navy-900">{f.description}</span>
                      <div className="font-mono text-[10px] text-slate-400 uppercase">
                        Factor: {f.category} • Rule: {f.ruleCode}
                      </div>
                    </div>
                    <span className="font-mono font-extrabold text-red-600 text-sm">
                      +{f.appliedPoints} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-slate-500 bg-amber-50 p-3 rounded-lg border border-amber-200 leading-relaxed">
              <strong>Audit Guarantee:</strong> Risk engine calculations are deterministic and explainable according to the Municipal Emergency Vulnerability Matrix ruleset.
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
