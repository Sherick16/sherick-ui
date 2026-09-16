const Container = ({ children }: { children: React.ReactNode }) => (
  <div className="h-[100dvh] flex">
    {children}
  </div>
);

export default Container;