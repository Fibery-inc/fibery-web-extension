import { QueryClient, QueryClientProvider /*setLogger*/ } from "react-query";

const queryClient = new QueryClient();

// eslint-disable-next-line @typescript-eslint/no-empty-function
// const noopPrint = () => {};
// setLogger({
//   log: noopPrint,
//   error: noopPrint,
//   warn: noopPrint,
// });

queryClient.setDefaultOptions({
  queries: {
    retry: process.env.NODE_ENV !== `test`,
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
