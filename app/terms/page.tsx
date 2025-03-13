import React from "react";
import NavBar from "../components/NavBar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Terms = () => {
  return (
    <div className="bg-gray-50">
      <NavBar />
      <div className=" w-[90vw] mx-auto pt-36 min-h-screen max-w-[800px]">
        <h2 className=" mb-2 text-3xl tracking-tight font-black  text-gray-900 ">
          Termos de Uso
        </h2>
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>1. Sobre Nós</AccordionTrigger>
            <AccordionContent>
              <p>
                A SemenTech é uma plataforma especializada na comercialização de
                sementes de alta qualidade para agricultura e jardinagem. Nosso
                objetivo é fornecer aos agricultores, produtores e entusiastas
                do cultivo as melhores variedades de sementes disponíveis no
                mercado. Todas as sementes comercializadas em nossa plataforma
                são certificadas e seguem as normas do Ministério da
                Agricultura.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>2. Produtos e Garantias</AccordionTrigger>
            <AccordionContent>
              Garantimos a qualidade e procedência de todas as nossas sementes.
              As imagens e descrições dos produtos são ilustrativas e
              representam fielmente as variedades oferecidas. A taxa de
              germinação indicada em cada produto é testada e certificada, porém
              pode variar de acordo com as condições de armazenamento e cultivo.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>
              3. Direitos Autorais e Propriedade Intelectual
            </AccordionTrigger>
            <AccordionContent>
              Todo o conteúdo do site, incluindo textos, gráficos, logos,
              ícones, imagens, descrições de variedades e informações técnicas,
              é propriedade da SemenTech ou de seus fornecedores e está
              protegido pelas leis de direitos autorais e de propriedade
              intelectual. As variedades patenteadas são comercializadas sob
              licença de seus obtentores.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>4. Política de Privacidade</AccordionTrigger>
            <AccordionContent>
              Protegemos rigorosamente os dados de nossos clientes. As
              informações coletadas são utilizadas apenas para processamento de
              pedidos, envio de recomendações de cultivo e comunicações
              relevantes sobre seus produtos. Não compartilhamos dados pessoais
              com terceiros, exceto quando necessário para a entrega dos
              produtos ou por obrigação legal.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>
              5. Modificação dos Termos de Uso
            </AccordionTrigger>
            <AccordionContent>
              Reservamo-nos o direito de modificar estes termos de uso a
              qualquer momento, sendo as alterações comunicadas através de nosso
              site. A continuidade do uso de nossos serviços após as
              modificações implica na aceitação dos novos termos.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default Terms;
