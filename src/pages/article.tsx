export const getServerSideProps = () => ({ props: { foo: "bar" } });

export default function Page(props: any) {
  return <p>{JSON.stringify(props)}</p>;
}
