import React, { useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
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

interface FormData {
  fullName: string;
  email: string;
  mobile: string;
  serviceCategory: string;
  specificService: string;
  pinCode: string;
  comments: string;
  consent: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  mobile?: string;
  serviceCategory?: string;
  specificService?: string;
  pinCode?: string;
  consent?: string;
}

export default function EnquiryForm() {
  const [formData, setFormData] = useState<FormData>({
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

  return (
    <div className="bg-white rounded-2xl border border-border-subtle p-7 sm:p-8 shadow-xl flex flex-col justify-between h-full">
        <div>
        <div className="mb-5 space-y-1">
          <h2 className="text-2xl font-extrabold text-charcoal tracking-tight">
            Request a consultation
          </h2>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            Share a few details and our team can follow up to discuss your requirements.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
          
          {/* Row 1: Full name & Mobile number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="fullName" className="block text-xs font-bold text-charcoal mb-1">
                Full name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
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
              <label htmlFor="mobile" className="block text-xs font-bold text-charcoal mb-1">
                Mobile number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                id="mobile"
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
              <label htmlFor="email" className="block text-xs font-bold text-charcoal mb-1">
                Email address
              </label>
              <input
                type="email"
                id="email"
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
              <label htmlFor="serviceCategory" className="block text-xs font-bold text-charcoal mb-1">
                Service category <span className="text-rose-500">*</span>
              </label>
              <select
                id="serviceCategory"
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
            <label htmlFor="specificService" className="block text-xs font-bold text-charcoal mb-1">
              Specific service (optional)
            </label>
            <input
              type="text"
              id="specificService"
              name="specificService"
              value={formData.specificService}
              onChange={handleChange}
              placeholder="e.g. home rental, health insurance, AC servicing"
              className="w-full px-3.5 py-2.5 rounded-lg border border-border-subtle hover:border-muted text-xs sm:text-sm bg-white transition-all focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-gold"
            />
          </div>

          {/* Row 4: PIN code (optional) */}
          <div>
            <label htmlFor="pinCode" className="block text-xs font-bold text-charcoal mb-1">
              PIN code (optional)
            </label>
            <input
              type="text"
              id="pinCode"
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
            <label htmlFor="comments" className="block text-xs font-bold text-charcoal mb-1">
              How can we help? (optional)
            </label>
            <textarea
              id="comments"
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
  );
}
