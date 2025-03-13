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
    <div>
      <NavBar />
      <div className=" w-[90vw] mx-auto mt-36 max-w-[800px]">
        <h2 className=" mb-2 text-3xl tracking-tight font-black  text-gray-900 ">
          Termos de Uso
        </h2>
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>1. Sobre Nós</AccordionTrigger>
            <AccordionContent>
              <p>
                A pexinxas.com é uma ferramenta de busca de ofertas independente
                que tem como objetivo ajudar os usuários a economizarem em suas
                compras online. No entanto, não somos responsáveis pelas ofertas
                exibidas em nosso site e nem pelas políticas das lojas
                referenciadas.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>2. Uso de Imagens</AccordionTrigger>
            <AccordionContent>
              Os logotipos mostrados no site pertencem às lojas correspondentes.
              As fotos dos produtos são obtidas dos próprios sites das
              respectivas lojas.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>3. Direitos Autorais</AccordionTrigger>
            <AccordionContent>
              Todo o conteúdo do site, incluindo textos, gráficos, logos,
              ícones, imagens e software, é propriedade da pexinxas.com
              ou de seus respectivos donos e está protegido pelas leis de
              direitos autorais e de propriedade intelectual.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>4. Política de privacidade</AccordionTrigger>
            <AccordionContent>
              A privacidade dos nossos usuários é de extrema importância para
              nós. No momento não exigimos cadastro de nenhum usuário da
              plataforma. Não compartilhamos seus dados com terceiros a não ser
              que sejemos obrigados por meios judiciais.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>5. Modificação dos Termos de Uso</AccordionTrigger>
            <AccordionContent>
              Os nossos termos de uso podem ser modificados a qualquer momento.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default Terms;
