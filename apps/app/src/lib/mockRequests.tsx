import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { RequestStatus, ServiceRequest } from "@kaundinya/config";
import { MOCK_REQUESTS } from "./mockData";

export interface RaiseRequestInput {
  serviceCategory: string;
  specificService: string;
  comments?: string;
}

interface MockRequestsValue {
  requests: ServiceRequest[];
  raiseRequest: (input: RaiseRequestInput) => ServiceRequest;
}

const MockRequestsContext = createContext<MockRequestsValue | null>(null);

let requestCounter = 2000;

export function MockRequestsProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<ServiceRequest[]>(MOCK_REQUESTS);

  const raiseRequest = useCallback((input: RaiseRequestInput) => {
    requestCounter += 1;
    const request: ServiceRequest = {
      id: `req-${requestCounter}`,
      serviceCategory: input.serviceCategory,
      specificService: input.specificService,
      status: "new" as RequestStatus,
      createdAt: new Date().toISOString().slice(0, 10),
      comments: input.comments ?? "",
    };
    setRequests((current) => [request, ...current]);
    return request;
  }, []);

  const value = useMemo(
    () => ({ requests, raiseRequest }),
    [requests, raiseRequest]
  );

  return (
    <MockRequestsContext.Provider value={value}>
      {children}
    </MockRequestsContext.Provider>
  );
}

export function useMockRequests(): MockRequestsValue {
  const value = useContext(MockRequestsContext);
  if (!value) {
    throw new Error("useMockRequests must be used within MockRequestsProvider");
  }
  return value;
}

export function useInsuranceRequests(): ServiceRequest[] {
  const { requests } = useMockRequests();
  return useMemo(
    () => requests.filter((request) => request.serviceCategory === "Insurance"),
    [requests]
  );
}
