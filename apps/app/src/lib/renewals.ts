import type { PolicyRecord } from "@kaundinya/config";

type RenewalRequestLike = {
  status: string;
  specificService?: string;
  title?: string;
};

function requestText(request: RenewalRequestLike) {
  return (request.specificService ?? request.title ?? "").toLowerCase();
}

export function isRenewalRequest(request: RenewalRequestLike) {
  return /renew/.test(requestText(request));
}

/** True when a renewal request already covers this policy. */
export function renewalRequestMatchesPolicy(
  request: RenewalRequestLike,
  policy: PolicyRecord,
) {
  const text = requestText(request);
  if (!/renew/.test(text)) return false;

  const number = policy.policyNumber?.trim().toLowerCase();
  if (number && text.includes(number)) return true;

  const provider = policy.provider?.trim().toLowerCase();
  if (!provider || !text.includes(provider)) return false;

  const type = policy.type?.toLowerCase();
  if (type && text.includes(type)) return true;

  // Motor requests often say "vehicle", "car" or "bike" instead of "Motor".
  return policy.type === "Motor" && /(motor|vehicle|car|bike|two-wheeler|four-wheeler|2w|4w)/.test(text);
}

/**
 * A policy's renewal banner is hidden once the client's renewal request for
 * that policy has been marked completed by the admin.
 */
export function isPolicyRenewalSolved(
  policy: PolicyRecord,
  requests: RenewalRequestLike[],
) {
  return requests.some(
    (request) =>
      request.status === "completed" &&
      renewalRequestMatchesPolicy(request, policy),
  );
}
