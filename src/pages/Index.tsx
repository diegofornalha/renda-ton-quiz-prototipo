import { Quiz } from "@/components/Quiz";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Quiz Renda Extra Ton - Teste seu Conhecimento</title>
        <meta
          name="description"
          content="Avalie seu conhecimento sobre o programa Renda Extra Ton e descubra seu nível: Iniciante, Especialista ou Embaixador!"
        />
      </Helmet>
      <Quiz />
    </>
  );
};

export default Index;
