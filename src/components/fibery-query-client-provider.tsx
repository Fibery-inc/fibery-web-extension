import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

queryClient.setDefaultOptions({
  queries: {
    retry: 0,
  },
});

export function FiberyQueryClientProvider({
  children,
}: {
  children: JSX.Element;
}): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
