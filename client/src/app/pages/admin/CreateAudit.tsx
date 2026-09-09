import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header';
import { auditService } from '../../services/auditService';
import { userService, UserProfile } from '../../services/userService';
import { ArrowLeft } from 'lucide-react';

export function CreateAudit() {
  const navigate = useNavigate();
  const [auditors, setAuditors] = useState<UserProfile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    description: '',
    startDate: '',
    dueDate: '',
    assignedAuditorId: '',
  });

  useEffect(() => {
    userService.getAuditors().then(setAuditors).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setSubmitting(true);

  try {
    const payload = {
      title: formData.title,
      department: formData.department,
      description: formData.description,
      start_date: formData.startDate,
      due_date: formData.dueDate,
      assigned_to: formData.assignedAuditorId
        ? Number(formData.assignedAuditorId)
        : undefined,
    };

    console.log(payload);

    await auditService.create(payload);
    navigate("/admin/audits");
  } catch (err: any) {
    setError(err.response?.data?.message || "Failed to create audit");
  } finally {
    setSubmitting(false);
  }
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="ml-64 pt-16">
      <Header title="Create New Audit" />

      <div className="p-8">
        <button onClick={() => navigate('/admin/audits')} className="flex items-center gap-2 text-gray-600 hover:text-[#EB8C00] mb-6 transition-colors">
          <ArrowLeft size={20} />
          <span>Back to Audits</span>
        </button>

        {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200 mb-6">{error}</div>}

        <div className="bg-[#F8F8F8] rounded-lg p-8 border border-[#DEDEDE] shadow-sm max-w-3xl">
          <h3 className="text-xl font-bold text-[#333333] mb-6">Audit Details</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#333333] mb-2">Audit Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange}
                className="w-full px-4 py-3 border border-[#DEDEDE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EB8C00] bg-white"
                placeholder="Enter audit title" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#333333] mb-2">Department *</label>
              <select name="department" value={formData.department} onChange={handleChange}
                className="w-full px-4 py-3 border border-[#DEDEDE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EB8C00] bg-white" required>
                <option value="">Select department</option>
                <option value="Finance">Finance</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Operations">Operations</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Sales & Marketing">Sales & Marketing</option>
                <option value="Legal & Compliance">Legal & Compliance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#333333] mb-2">Description *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={4}
                className="w-full px-4 py-3 border border-[#DEDEDE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EB8C00] bg-white resize-none"
                placeholder="Enter audit description and scope" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#333333] mb-2">Start Date *</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange}
                  className="w-full px-4 py-3 border border-[#DEDEDE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EB8C00] bg-white" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333333] mb-2">Due Date *</label>
                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange}
                  className="w-full px-4 py-3 border border-[#DEDEDE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EB8C00] bg-white" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#333333] mb-2">Assigned Auditor</label>
              <select name="assignedAuditorId" value={formData.assignedAuditorId} onChange={handleChange}
                className="w-full px-4 py-3 border border-[#DEDEDE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EB8C00] bg-white">
                <option value="">Select auditor (optional)</option>
                {auditors.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="submit" disabled={submitting}
                className="bg-[#EB8C00] hover:bg-[#D04A02] disabled:opacity-60 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                {submitting ? 'Creating...' : 'Create Audit'}
              </button>
              <button type="button" onClick={() => navigate('/admin/audits')}
                className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-lg font-medium border border-[#DEDEDE] transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
