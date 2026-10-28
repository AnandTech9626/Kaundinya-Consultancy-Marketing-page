import React, { useState, useEffect } from "react";
import { X, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { redirectToAppOtp } from "../lib/routing";

const CATEGORY_OPTIONS: Record<string, string[]> = {
  "Real Estate": [
    "Property Rentals (Residential)",
    "Property Rentals (Commercial)",
    "Property Buying Assistance",
    "Property Selling Assistance",
    "Rental Agreement & Tenant Verification",
  ],
  "Insurance": [
    "Life & Term Insurance Advisory",
    "Comprehensive Health Insurance",
    "Two-Wheeler Motor Insurance",
    "Four-Wheeler Motor Insurance",
    "Property & Fire Insurance",
  ],
  "Property Management & Home Services": [
    "Pigeon Safety Nets Installation",
    "Invisible Safety Grills Installation",
    "Air Conditioner (AC) Servicing",
    "Refrigerator Servicing",
    "Aadhaar & Voter ID Update Assistance Coordination",
    "Interior Design Consultation",
  ],
  "Loans": [
    "Home Loan (Purchase / Construction)",
    "Personal Loan",
    "Business Loan",
    "Loan Against Property (Mortgage)",
  ],
};

interface FormErrors {
  fullName?: string;
  email?: string;
  mobile?: string;
  serviceCategory?: string;
  pinCode?: string;
  consent?: string;
}

export default function ConsultationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    serviceCategory: "",
    specificService: "",
    pinCode: "",
    comments: "",
    consent: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === "#consultation") {
        setIsOpen(true);
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);

    const handleCustomTrigger = (e: Event) => {
      const target = (e.target as HTMLElement).closest("[data-open-consultation]");
      if (target) {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    document.addEventListener("click", handleCustomTrigger);

    const handleCustomEvent = () => setIsOpen(true);
    window.addEventListener("open-consultation-modal", handleCustomEvent);

    return () => {
      window.removeEventListener("hashchange", handleHash);
      document.removeEventListener("click", handleCustomTrigger);
      window.removeEventListener("open-consultation-modal", handleCustomEvent);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
      if (window.location.hash === "#consultation") {
        history.replaceState(null, document.title, window.location.pathname + window.location.search);
      }
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newErrors.fullName = "Please enter your full name.";
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    const cleanMobile = formData.mobile.replace(/[^0-9]/g, "");
    if (!cleanMobile || cleanMobile.length < 10) {
      newErrors.mobile = "Please enter a valid 10-digit mobile number.";
    }

    if (!formData.serviceCategory) {
      newErrors.serviceCategory = "Please select a service category.";
    }

    if (formData.pinCode.trim() && !/^[1-9][0-9]{5}$/.test(formData.pinCode.trim())) {
      newErrors.pinCode = "Please enter a valid 6-digit Indian PIN code.";
    }

    if (!formData.consent) {
      newErrors.consent = "You must agree to be contacted regarding your enquiry.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: val,
      ...(name === "serviceCategory" ? { specificService: "" } : {}),
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    // OTP send will be handled by the backend (POST /api/otp/send) once ready.
    // For now we simulate the send and hand off to the app's OTP screen.
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSubmitting(false);
    redirectToAppOtp(formData.mobile);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consultation-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-scrollbar"
    >
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Main Container - 2 Cards of Exact Same Height */}
      <div className="relative w-full max-w-5xl z-10 my-auto animate-in zoom-in-95 duration-200">
        
        {/* Floating Close Button */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Close dialog"
          className="absolute -top-3 -right-3 z-20 w-8 h-8 rounded-full bg-charcoal text-white hover:bg-gold hover:text-charcoal border border-white/20 shadow-lg flex items-center justify-center transition-all cursor-pointer focus:outline-none"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 2-Column Grid: Left Black Card & Right White Form with Equal Height */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
          
          {/* Left Column: Black Card (Same Height) */}
          <div className="lg:col-span-5 h-full">
            <div className="bg-charcoal text-white rounded-2xl p-7 sm:p-8 border border-charcoal-light shadow-2xl flex flex-col justify-between h-full space-y-6">
              
              {/* Top Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold">
                  <span className="w-5 h-0.5 bg-gold"></span>
                  <span>TALK TO OUR TEAM</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  We&apos;re here to help you get started.
                </h2>
                <p className="text-xs sm:text-sm text-ivory/70 leading-relaxed">
                  Contact us about real estate, insurance, loans, property management or home services.
                </p>
              </div>

              {/* Middle Section: Leadership Contacts */}
              <div className="space-y-4">
                <div className="border-t border-charcoal-light/70 pt-4 space-y-1">
                  <p className="text-[11px] text-ivory/60 font-medium">Managing Director / Principal</p>
                  <p className="text-sm font-bold text-white">Sampath Krishna Goud</p>
                </div>

                <div className="border-t border-charcoal-light/70 pt-4 space-y-1">
                  <p className="text-[11px] text-ivory/60 font-medium">Managing Partner</p>
                  <p className="text-sm font-bold text-white">Harika Garre</p>
                </div>
              </div>

              {/* Bottom Section: Service Area */}
              <div className="border-t border-charcoal-light/70 pt-4 space-y-1">
                <p className="text-[11px] text-ivory/60 font-medium">Service area</p>
                <p className="text-sm font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gold" />
                  <span>Hyderabad & surrounding areas</span>
                </p>
              </div>

            </div>
          </div>

          {/* Right Column: White Form Card (Same Height) */}
          <div className="lg:col-span-7 h-full">
            <div className="bg-white rounded-2xl p-7 sm:p-8 border border-border-subtle shadow-2xl flex flex-col justify-between h-full">
              
              <div className="mb-5 space-y-1">
                <h3 id="consultation-modal-title" className="text-2xl font-extrabold text-charcoal tracking-tight">
                  Request a consultation
                </h3>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  Share a few details and our team can follow up to discuss your requirements.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-3.5 flex-1 flex flex-col justify-between">
                
                {/* Row 1: Full name & Mobile number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label htmlFor="modal-fullName" className="block text-xs font-bold text-charcoal mb-1">
                      Full name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="modal-fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm bg-white transition-all focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold ${
                        errors.fullName ? "border-rose-400 bg-rose-50/20" : "border-border-subtle hover:border-muted"
                      }`}
                    />
                    {errors.fullName && <p className="mt-1 text-[11px] text-rose-600">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label htmlFor="modal-mobile" className="block text-xs font-bold text-charcoal mb-1">
                      Mobile number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="modal-mobile"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      maxLength={14}
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm bg-white transition-all focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold ${
                        errors.mobile ? "border-rose-400 bg-rose-50/20" : "border-border-subtle hover:border-muted"
                      }`}
                    />
                    {errors.mobile && <p className="mt-1 text-[11px] text-rose-600">{errors.mobile}</p>}
                  </div>
                </div>

                {/* Row 2: Email address & Service category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label htmlFor="modal-email" className="block text-xs font-bold text-charcoal mb-1">
                      Email address
                    </label>
                    <input
                      type="email"
                      id="modal-email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm bg-white transition-all focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold ${
                        errors.email ? "border-rose-400 bg-rose-50/20" : "border-border-subtle hover:border-muted"
                      }`}
                    />
                    {errors.email && <p className="mt-1 text-[11px] text-rose-600">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="modal-category" className="block text-xs font-bold text-charcoal mb-1">
                      Service category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="modal-category"
                      name="serviceCategory"
                      value={formData.serviceCategory}
                      onChange={handleChange}
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm bg-white transition-all focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold cursor-pointer ${
                        errors.serviceCategory ? "border-rose-400 bg-rose-50/20" : "border-border-subtle hover:border-muted"
                      }`}
                    >
                      <option value="">Select a service</option>
                      {Object.keys(CATEGORY_OPTIONS).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {errors.serviceCategory && (
                      <p className="mt-1 text-[11px] text-rose-600">{errors.serviceCategory}</p>
                    )}
                  </div>
                </div>

                {/* Row 3: Specific service (optional) */}
                <div>
                  <label htmlFor="modal-specificService" className="block text-xs font-bold text-charcoal mb-1">
                    Specific service (optional)
                  </label>
                  <input
                    type="text"
                    id="modal-specificService"
                    name="specificService"
                    value={formData.specificService}
                    onChange={handleChange}
                    placeholder="e.g. home rental, health insurance, AC servicing"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border-subtle hover:border-muted text-xs sm:text-sm bg-white transition-all focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold"
                  />
                </div>

                {/* Row 4: PIN code (optional) */}
                <div>
                  <label htmlFor="modal-pinCode" className="block text-xs font-bold text-charcoal mb-1">
                    PIN code (optional)
                  </label>
                  <input
                    type="text"
                    id="modal-pinCode"
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleChange}
                    placeholder="6-digit PIN code"
                    maxLength={6}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-xs sm:text-sm bg-white transition-all focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold ${
                      errors.pinCode ? "border-rose-400 bg-rose-50/20" : "border-border-subtle hover:border-muted"
                    }`}
                  />
                  {errors.pinCode && <p className="mt-1 text-[11px] text-rose-600">{errors.pinCode}</p>}
                </div>

                {/* Row 5: How can we help? (optional) */}
                <div>
                  <label htmlFor="modal-comments" className="block text-xs font-bold text-charcoal mb-1">
                    How can we help? (optional)
                  </label>
                  <textarea
                    id="modal-comments"
                    name="comments"
                    value={formData.comments}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Briefly describe what you are looking for"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border-subtle hover:border-muted text-xs sm:text-sm bg-white transition-all focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold resize-none"
                  />
                </div>

                {/* Row 6: Consent Checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      name="consent"
                      checked={formData.consent}
                      onChange={handleChange}
                      className="w-4 h-4 mt-0.5 rounded border-border-subtle text-gold focus:ring-gold cursor-pointer shrink-0"
                    />
                    <span className="text-[11px] sm:text-xs text-muted leading-tight">
                      I agree that Kaundinya Consultancy may contact me about this enquiry. Please review the business privacy policy before publishing this form.
                    </span>
                  </label>
                  {errors.consent && <p className="mt-1 text-[11px] text-rose-600">{errors.consent}</p>}
                </div>

                {/* Row 7: Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-6 rounded-lg text-xs sm:text-sm font-bold text-charcoal bg-gold hover:bg-gold-hover active:bg-gold-muted transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Verification Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

              </form>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
