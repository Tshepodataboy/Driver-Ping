import React, { useState } from 'react';
import { useApp } from '../context/AppContext.js';
import {
  Car,
  Plus,
  ShieldCheck,
  Users,
  UserPlus,
  Trash2,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  X,
  UploadCloud,
  ChevronRight,
  Search,
} from 'lucide-react';
import { SA_PROVINCES, searchProvinces } from '../constants/provinces.js';
import { ProvincialPlate, detectProvinceFromPlate } from '../components/ProvincialPlate.js';

export function VehiclesScreen() {
  const {
    user,
    vehicles,
    registerVehicle,
    submitOwnershipProof,
    manageDriver,
    addTrustedContact,
    removeTrustedContact,
    updateUserPreferences,
  } = useApp();

  // Modals
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isOwnershipDocOpen, setIsOwnershipDocOpen] = useState(false);
  const [targetVehicleId, setTargetVehicleId] = useState<string | null>(null);

  // Add Vehicle form
  const [provinceCode, setProvinceCode] = useState('GP');
  const [provinceSearch, setProvinceSearch] = useState('');
  const [plate, setPlate] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ message?: string; error?: string } | null>(null);

  // Ownership doc form
  const [docName, setDocName] = useState('V5C_Registration_Logbook.pdf');
  const [docType, setDocType] = useState('v5c_logbook');
  const [docFeedback, setDocFeedback] = useState<{ message?: string; error?: string; requiresUpgrade?: boolean } | null>(null);

  // Trusted contact form
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [relationship, setRelationship] = useState('Family / Secondary Driver');
  const [consentGiven, setConsentGiven] = useState(true);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    const clean = plate.trim().toUpperCase();
    const finalPlate = clean.endsWith(provinceCode) ? clean : `${clean} ${provinceCode}`;

    const res = await registerVehicle({ plate: finalPlate, make, model, color });
    setIsSubmitting(false);

    if (res.success) {
      setFeedback({ message: res.message });
      setPlate('');
      setMake('');
      setModel('');
      setColor('');
      setTimeout(() => setIsAddVehicleOpen(false), 1500);
    } else {
      setFeedback({ error: res.error });
    }
  };

  const handleSubmitDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetVehicleId || !docName.trim()) return;

    setIsSubmitting(true);
    setDocFeedback(null);

    const res = await submitOwnershipProof(targetVehicleId, {
      documentName: docName,
      documentType: docType,
    });
    setIsSubmitting(false);

    if (res.success) {
      setDocFeedback({ message: res.message });
      setTimeout(() => setIsOwnershipDocOpen(false), 2000);
    } else {
      setDocFeedback({ error: res.error, requiresUpgrade: res.requiresUpgrade });
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetVehicleId || !contactName.trim() || !contactPhone.trim()) return;

    setIsSubmitting(true);
    const res = await addTrustedContact(targetVehicleId, {
      name: contactName,
      phone: contactPhone,
      relationship,
      consentGiven,
    });
    setIsSubmitting(false);

    if (res.success) {
      setIsAddContactOpen(false);
      setContactName('');
      setContactPhone('');
    }
  };

  return (
    <div className="pb-28 pt-3 px-3 max-w-[420px] mx-auto text-gray-900">
      {/* Top Header Card */}
      <div className="bg-white rounded-[34px] p-6 crimson-card-shadow mb-4">
        {/* Top Dark Capsule Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0D1829] text-white rounded-full text-[9px] font-black uppercase tracking-widest mb-3 shadow-sm">
          <span>VEHICLE FLEET & DRIVERS</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black font-display text-gray-950">
              Your Vehicles
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Registered cars receive gentle anonymous observations.
            </p>
          </div>

          <button
            onClick={() => {
              setFeedback(null);
              setIsAddVehicleOpen(true);
            }}
            className="px-3.5 py-2.5 bg-[#B81D39] hover:bg-[#9E142C] text-white text-xs font-bold rounded-2xl shadow-md shadow-red-900/20 flex items-center gap-1.5 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Car</span>
          </button>
        </div>
      </div>

      {vehicles.length === 0 ? (
        <div className="bg-white rounded-[34px] p-8 text-center crimson-card-shadow mt-4">
          <div className="w-16 h-16 rounded-3xl bg-red-50 text-[#B81D39] flex items-center justify-center mx-auto mb-3">
            <Car className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-black text-gray-900 font-display">
            No vehicles registered yet
          </h2>
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Register your car's number plate so other drivers can anonymously let you know if a brake light is out, a tyre is low, or there's a safety issue.
          </p>
          <button
            onClick={() => setIsAddVehicleOpen(true)}
            className="mt-5 px-6 py-3 bg-[#B81D39] text-white text-xs font-bold rounded-2xl hover:bg-[#9E142C] shadow-md shadow-red-900/20"
          >
            Register My Vehicle
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {vehicles.map((veh) => (
            <div
              key={veh.id}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-28 mb-1.5 shadow-2xs">
                    <ProvincialPlate
                      provinceCode={detectProvinceFromPlate(veh.plateDisplay)}
                      plateText={veh.plateDisplay}
                    />
                  </div>
                  <h2 className="text-sm font-bold text-gray-900 mt-1">
                    {veh.make} {veh.model}
                  </h2>
                  <span className="text-xs text-gray-400">{veh.color}</span>
                </div>

                <div className="text-right">
                  {veh.isVerifiedOwner ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified Owner</span>
                    </span>
                  ) : veh.driverStatus === 'pending_owner_approval' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pending Owner Approval</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                      <span>Registered Driver</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Status explanation if pending approval */}
              {veh.driverStatus === 'pending_owner_approval' && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/50 rounded-xl text-xs text-amber-900 leading-relaxed">
                  This vehicle has a verified owner. Your registration as an authorized driver is awaiting their confirmation.
                </div>
              )}

              {/* Verified Owner Controls (Rule 4, 5) */}
              {veh.isVerifiedOwner ? (
                <div className="pt-2 border-t border-gray-100 space-y-3">
                  {/* Drivers Management */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-gray-500" />
                        <span>Registered Drivers ({veh.allDrivers.length})</span>
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {veh.allDrivers.map((driver) => (
                        <div
                          key={driver.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-gray-50 text-xs"
                        >
                          <div>
                            <span className="font-semibold text-gray-800">
                              {driver.fullName}
                            </span>
                            <span className="text-gray-400 text-[11px] ml-1.5">
                              {driver.role === 'owner' ? '(Owner)' : `(${driver.status})`}
                            </span>
                          </div>

                          {driver.role !== 'owner' && (
                            <div className="flex items-center gap-1">
                              {driver.status === 'pending_owner_approval' && (
                                <button
                                  onClick={() => manageDriver(veh.id, driver.id, 'approve')}
                                  className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-semibold"
                                >
                                  Approve
                                </button>
                              )}
                              <button
                                onClick={() => manageDriver(veh.id, driver.id, 'remove')}
                                className="p-1 text-red-500 hover:text-red-700"
                                title="Remove driver"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trusted Contacts with Consent (Rule 5) */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-gray-700">
                        Trusted Contacts (Alerts CC'd)
                      </span>
                      <button
                        onClick={() => {
                          setTargetVehicleId(veh.id);
                          setIsAddContactOpen(true);
                        }}
                        className="text-xs font-semibold text-[#FF4400] flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>

                    {veh.trustedContacts.length === 0 ? (
                      <p className="text-[11px] text-gray-400 italic">
                        No trusted contacts added. (e.g. Spouse or mechanic)
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {veh.trustedContacts.map((tc) => (
                          <div
                            key={tc.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-gray-50 text-xs"
                          >
                            <div>
                              <span className="font-medium text-gray-800">{tc.name}</span>
                              <span className="text-gray-400 text-[10px] ml-1">
                                · {tc.relationship}
                              </span>
                            </div>
                            <button
                              onClick={() => removeTrustedContact(veh.id, tc.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Driver seeking to prove ownership (Rule 4) */
                <div className="pt-2 border-t border-gray-100">
                  {veh.pendingOwnershipVerification ? (
                    <div className="p-2.5 bg-blue-50/80 rounded-xl flex items-center gap-2 text-xs text-blue-900">
                      <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>
                        Ownership documentation is currently pending admin review.
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setTargetVehicleId(veh.id);
                        setDocFeedback(null);
                        setIsOwnershipDocOpen(true);
                      }}
                      className="w-full py-2 px-3 border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-semibold text-gray-700 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#FF4400]" />
                      <span>Prove Ownership (Submit V5C / Logbook)</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ADD VEHICLE MODAL */}
      {isAddVehicleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-gray-100">
            <button
              onClick={() => setIsAddVehicleOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold font-display text-gray-950">
              Register a Vehicle
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Add a vehicle you drive to start receiving safety observations.
            </p>

            {feedback?.error && (
              <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-xl text-xs">
                {feedback.error}
              </div>
            )}
            {feedback?.message && (
              <div className="mt-3 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs">
                {feedback.message}
              </div>
            )}

            <form onSubmit={handleRegister} className="mt-4 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    Province Search Engine
                  </label>
                  <span className="text-[10px] text-gray-400 font-medium">Search required</span>
                </div>
                {/* Search Engine Input for Provinces */}
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={provinceSearch}
                    onChange={(e) => setProvinceSearch(e.target.value)}
                    placeholder="Search by province name (e.g. Gauteng, Western Cape) or code (GP, WC)..."
                    className="w-full pl-8 pr-7 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B81D39]/20 focus:border-[#B81D39]"
                  />
                  {provinceSearch && (
                    <button
                      type="button"
                      onClick={() => setProvinceSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Search Engine Results: Only shown when searching */}
                {provinceSearch.trim() ? (
                  <div className="space-y-1 max-h-40 overflow-y-auto mb-2 pr-0.5 animate-in fade-in">
                    {searchProvinces(provinceSearch).length === 0 ? (
                      <div className="p-2.5 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center text-[11px] text-gray-500">
                        No provinces match "{provinceSearch}". Try searching by province name (e.g. Gauteng, Western Cape) or code (GP, WC).
                      </div>
                    ) : (
                      searchProvinces(provinceSearch).map((prov) => (
                        <button
                          key={prov.code}
                          type="button"
                          onClick={() => {
                            setProvinceCode(prov.code);
                            setProvinceSearch('');
                          }}
                          className={`w-full p-2 rounded-xl border text-left flex items-center justify-between text-xs transition-colors cursor-pointer gap-2 ${
                            provinceCode === prov.code
                              ? 'border-[#B81D39] bg-red-50 text-[#B81D39]'
                              : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-6 h-6 rounded-md bg-gray-950 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                              {prov.code}
                            </span>
                            <span className="font-semibold truncate">{prov.name} ({prov.code})</span>
                          </div>
                          <div className="w-20 shrink-0 text-right">
                            <ProvincialPlate provinceCode={prov.code} className="w-full drop-shadow-2xs" />
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="p-2.5 bg-red-50/70 border border-red-100 rounded-xl flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-[#B81D39] text-white font-mono font-bold text-[10px] flex items-center justify-center">
                        {provinceCode}
                      </span>
                      <span className="text-xs font-semibold text-gray-900">
                        {SA_PROVINCES.find((p) => p.code === provinceCode)?.name || 'Selected'} ({provinceCode})
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      Type above to change
                    </span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    Registration Number
                  </label>
                  <span className="text-[10px] text-gray-400">
                    Tag: {SA_PROVINCES.find((p) => p.code === provinceCode)?.plateExample}
                  </span>
                </div>

                {/* Live Provincial Plate Artwork Preview */}
                <div className="mb-2 max-w-[240px] mx-auto rounded-xl overflow-hidden p-1 bg-white border border-gray-200 shadow-sm">
                  <ProvincialPlate
                    provinceCode={provinceCode}
                    plateText={plate.trim() ? (plate.endsWith(provinceCode) ? plate : `${plate} ${provinceCode}`) : SA_PROVINCES.find((p) => p.code === provinceCode)?.plateExample}
                  />
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    value={plate}
                    onChange={(e) => setPlate(e.target.value.toUpperCase())}
                    placeholder={provinceCode === 'GP' ? 'e.g. AB 12 CD GP' : provinceCode === 'WC' ? 'e.g. CA 123-456' : 'e.g. 123-456'}
                    className="w-full text-center py-2.5 px-3 bg-gray-50 border-2 border-gray-300 focus:border-[#941329] focus:bg-white rounded-xl text-sm font-mono font-black text-gray-900 placeholder:text-gray-400 focus:outline-none uppercase"
                  />
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <span className="text-[10px] font-mono font-bold bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">
                      {provinceCode}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Make
                  </label>
                  <input
                    type="text"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    placeholder="e.g. Ford"
                    className="w-full p-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Fiesta"
                    className="w-full p-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Colour
                </label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. Metallic Grey"
                  className="w-full p-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !plate.trim()}
                  className="w-full py-3.5 bg-[#B81D39] hover:bg-[#9E142C] text-white font-bold text-xs rounded-2xl shadow-lg shadow-red-900/20 disabled:opacity-40"
                >
                  {isSubmitting ? 'Registering...' : 'Register as Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OWNERSHIP PROOF MODAL (Rule 4: Paid plan check + Admin review) */}
      {isOwnershipDocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-[34px] max-w-sm w-full p-6 shadow-2xl relative border border-gray-100">
            <button
              onClick={() => setIsOwnershipDocOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-black font-display text-gray-950">
              Submit Ownership Proof
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              To become the verified owner, submit your V5C registration or vehicle title. An admin will review it.
            </p>

            {/* Rule 4: Paying never automatically grants ownership */}
            <div className="mt-3 p-3 bg-amber-50 rounded-2xl text-xs text-amber-900 leading-relaxed border border-amber-200/50">
              <strong>Important Rule:</strong> Paying for an Owner Plan does not automatically make you the owner. Documents must be verified by a compliance admin.
            </div>

            {docFeedback?.error && (
              <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-2xl text-xs space-y-2">
                <p>{docFeedback.error}</p>
                {docFeedback.requiresUpgrade && (
                  <button
                    onClick={async () => {
                      await updateUserPreferences({ plan: 'paid_owner' });
                      setDocFeedback({ message: 'Upgraded to Paid Owner Plan! Now click submit below.' });
                    }}
                    className="w-full py-2 bg-[#B81D39] text-white font-bold text-xs rounded-xl"
                  >
                    Upgrade to Paid Owner Plan (R49/mo)
                  </button>
                )}
              </div>
            )}

            {docFeedback?.message && (
              <div className="mt-3 p-3 bg-emerald-50 text-emerald-800 rounded-2xl text-xs">
                {docFeedback.message}
              </div>
            )}

            <form onSubmit={handleSubmitDoc} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Document Type
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none"
                >
                  <option value="v5c_logbook">V5C Registration Certificate (Logbook)</option>
                  <option value="title_certificate">Vehicle Title / Certificate</option>
                  <option value="bill_of_sale">Bill of Sale with Insurance Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Document File Name
                </label>
                <input
                  type="text"
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. V5C_Logbook.pdf"
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="p-3 border-2 border-dashed border-gray-200 rounded-2xl text-center text-xs text-gray-500">
                <UploadCloud className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                <span>Simulated Secure Document Attachment</span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#B81D39] text-white font-bold text-xs rounded-2xl hover:bg-[#9E142C] disabled:opacity-40 shadow-md shadow-red-900/20"
                >
                  {isSubmitting ? 'Submitting to Admin...' : 'Submit for Admin Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TRUSTED CONTACT MODAL (Rule 5: with consent) */}
      {isAddContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-[34px] max-w-sm w-full p-6 shadow-2xl relative border border-gray-100">
            <button
              onClick={() => setIsAddContactOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-black font-display text-gray-950">
              Add Trusted Contact
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Trusted contacts receive a copy of safety alerts for this vehicle.
            </p>

            <form onSubmit={handleAddContact} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Sarah Morgan"
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+27 82 555 0321"
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="e.g. Spouse / Fleet Partner"
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              {/* Consent checkbox (Rule 5 requirement) */}
              <label className="flex items-start gap-2.5 p-3 bg-gray-50 rounded-2xl text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-0.5 text-[#B81D39] rounded focus:ring-[#B81D39]"
                />
                <span>
                  I confirm this person has given explicit consent to receive vehicle notifications on their mobile.
                </span>
              </label>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !consentGiven}
                  className="w-full py-3 bg-[#B81D39] text-white font-bold text-xs rounded-2xl hover:bg-[#9E142C] disabled:opacity-40 shadow-md shadow-red-900/20"
                >
                  {isSubmitting ? 'Saving...' : 'Add Trusted Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
