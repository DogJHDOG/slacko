import React, { useState } from 'react';
import { X, UserPlus, Mail, Phone, ChevronDown, ChevronUp } from 'lucide-react';

const TeamMemberSelector = ({ team, selectedMembers, onMembersChange, availableMembers = [] }) => {
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Member'
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email) return;
    
    const member = {
      id: Date.now(),
      name: newMember.name,
      email: newMember.email,
      phone: newMember.phone,
      role: newMember.role,
      avatar: `https://i.pravatar.cc/40?img=${Date.now()}`
    };
    
    onMembersChange([...selectedMembers, member]);
    setNewMember({ name: '', email: '', phone: '', role: 'Member' });
    setShowAddForm(false);
  };

  const handleRemoveMember = (memberId) => {
    onMembersChange(selectedMembers.filter(member => member.id !== memberId));
  };

  const handleInputChange = (field, value) => {
    setNewMember(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-700">팀원 관리</h4>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{selectedMembers.length}명</span>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="sm:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {showAddForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>
      
      {/* Add New Member Form */}
      <div className={`bg-slate-50 rounded-lg border border-slate-200 transition-all duration-200 ${
        showAddForm ? 'block' : 'hidden sm:block'
      }`}>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between sm:hidden">
            <h5 className="font-medium text-slate-800">새 팀원 추가</h5>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Form Fields - Responsive Grid */}
          <div className="space-y-3">
            {/* Name and Email - Stack on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="팀원 이름"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="email@example.com"
                />
              </div>
            </div>
            
            {/* Phone and Role - Stack on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">전화번호</label>
                <input
                  type="tel"
                  value={newMember.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="010-1234-5678"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">역할</label>
                <select
                  value={newMember.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="PM">PM</option>
                  <option value="Designer">Designer</option>
                  <option value="Developer">Developer</option>
                  <option value="QA">QA</option>
                  <option value="Member">Member</option>
                </select>
              </div>
            </div>
            
            {/* Add Button */}
            <button
              onClick={handleAddMember}
              disabled={!newMember.name || !newMember.email}
              className="w-full px-4 py-2.5 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              팀원 추가
            </button>
          </div>
        </div>
      </div>
      
      {/* Team Members List */}
      <div className="space-y-2">
        {selectedMembers.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="text-sm font-medium text-slate-900 truncate">
                    {member.name}
                  </span>
                  <span className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded-full w-fit">
                    {member.role}
                  </span>
                </div>
                
                {/* Contact Info - Responsive */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-slate-500 mt-1">
                  <div className="flex items-center gap-1 truncate">
                    <Mail className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => handleRemoveMember(member.id)}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      
      {/* Empty State */}
      {selectedMembers.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 bg-slate-100 rounded-full flex items-center justify-center">
            <UserPlus className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300" />
          </div>
          <p className="text-sm font-medium">아직 팀원이 없습니다</p>
          <p className="text-xs mt-1">위 폼에서 팀원을 추가해주세요</p>
        </div>
      )}
    </div>
  );
};

export default TeamMemberSelector;