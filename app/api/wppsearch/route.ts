export const maxDuration = 60;

import { pipeline } from "@xenova/transformers";

export async function POST(request: Request) {
  let offersImageEmbeds = [];
  let similarOffers = [];
  let { imageUrl } = await request.json()

  function cosineSimilarity(vec1: number[], vec2: number[]) {
    let dotProd = 0,
      mag1 = 0,
      mag2 = 0;
    for (let i = 0; i < vec1.length; i++) {
      dotProd += vec1[i] * vec2[i];
      mag1 += vec1[i] * vec1[i];
      mag2 += vec2[i] * vec2[i];
    }
    return dotProd / (Math.sqrt(mag1) * Math.sqrt(mag2));
  }

  let offers: any = [
    {
      position: 33,
      title: "Poltrona Vitoria Veludo - Palladium Decor - Rosa",
      link: "https://www.palladiumdecor.com.br/sala-de-estar/poltronas/poltrona-vitoria-veludo-palladium-decor",
      source: "Palladium Decor",
      source_icon:
        "https://encrypted-tbn3.gstatic.com/favicon-tbn?q=tbn:ANd9GcRjcF2fscnvJOSKEgJvCJhIp2uOKffxjkILq2j63B6h3YmJbNTdqH5TquMXjs3_UJbcWpfbP11dCOibHV4xpFzPqAQHweQCqXbm4LBtrvqTTrfWwdX1eCmKNwCvwJs0",
      price: 565.79,
      thumbnail:
        "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcS533YFs_p9kwPQ3nL86kLuybvsNyA2jePiMw5ipPFFCfSJGnfN",
      in_stock: true,
    },
    {
      position: 7,
      block_position: "top",
      title: "Poltrona Ravena Algodão Bege e Nogueira - Volttoni",
      price: 568.54,
      extracted_price: 568.54,
      link: "https://www.google.com.br/aclk?sa=l&ai=DChcSEwjUzbK9seOHAxVvNK0GHcbHGq4YABANGgJwdg&co=1&ase=2&gclid=EAIaIQobChMI1M2yvbHjhwMVbzStBh3GxxquEAQYByABEgKeAvD_BwE&sig=AOD64_0MHLfIbE7TmMTxaHcL6GLpARY00w&ctype=5&q=&nis=4&ved=0ahUKEwik4Ku9seOHAxV3KUQIHdUNDTwQww8Iogg&adurl=",
      source: "magazine luiza",
      thumbnail:
        "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSquTdhTBM3ISI8PpnDUCp5CDBDls_u2ZgI15wYLLNtFTZtx6RdOgxgEkpoz8iOBARvz3w3OIfwggu7fYz-o1Ez92HHN2cZAeFqUB4q2ko&usqp=CAE",
    },
    {
      position: 44,
      title: "Poltrona em Madeira Maciça Antônia Volttoni",
      link: "https://www.madeiramadeira.com.br/poltrona-em-madeira-macica-antonia-volttoni-674998.html",
      source: "Madeira Madeira",
      source_icon:
        "https://encrypted-tbn2.gstatic.com/favicon-tbn?q=tbn:ANd9GcTkYN5iD9C8Mz-XHrC1EN_tKoeDAAA1JYFkwCNywbJGg4Ar25SAPaPWSRnYdcyrakdumfRTj7pynLt8KUFCqjc-4T9kj4R-dvyhXrbPUArquMY7EWnNpBYzB7RXPW7i",
      price: 579.9,
      thumbnail:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxLXM0aiVaLZbA-ELySUSAD_Oi5JAbf0T68vjJkrb1PbKj-feb",
      in_stock: false,
    },
    {
      position: 23,
      title: "Poltrona Decorativa Júlia Para Sala Linho Crú",
      link: "https://www.shoptime.com.br/produto/6720063229/poltrona-decorativa-julia-para-sala-linho-cru?pfm_index=NaN&pfm_page=lojista&pfm_pos=grid&pfm_type=lojista_page&sellerId=29783173000105",
      source: "Shoptime",
      source_icon:
        "https://encrypted-tbn3.gstatic.com/favicon-tbn?q=tbn:ANd9GcTOz4gpe3OYjsTYw-EX-i_-EZYQZUxZ_JIryPqyp519shEqvlOhyi3uaOQQxU2NqrHcYJXdpTmxJveAL35oED7srV3DEduXHYtRHw661bNx68S7x5f46NFj",
      price: 649.35,
      thumbnail:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLRog3K-6rwTzyw6ofw4tKftSm5KQ1sCf-wcPC1cL70R61d2Sy",
      in_stock: true,
    },
    {
      position: 14,
      title: "Poltrona em Linho 226 Tip Areia - Bege",
      link: "https://www.casasbahia.com.br/poltrona-em-linho-226-tip-areia/p/1561824198",
      source: "Casas Bahia",
      source_icon:
        "https://encrypted-tbn3.gstatic.com/favicon-tbn?q=tbn:ANd9GcQqxA3Vj_0Ggn1-_QLIdd4V54RCi8jMG7oQ6oaTYvcw1dOi3ArJDP4wNuOLYl3c0AxnY0UbHh6NEYd9DRv0NLOdk6G1vdEI-9RzN_GmSSLvDwC_mFkg2GXMn5c",
      price: 749.99,
      thumbnail:
        "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcT8BGP70ej_6Bg1DTo-TPn6JyevyMn3uJRbEJmjlxc1HtOLhyvQ",
      in_stock: true,
    },
    {
      position: 47,
      title: "Poltrona Em Madeira Maciça Antônia Volttoni Id",
      link: "https://produto.mercadolivre.com.br/MLB-1878342053-poltrona-em-madeira-macica-antnia-volttoni-id-_JM",
      source: "Mercado Livre",
      source_icon:
        "https://encrypted-tbn2.gstatic.com/favicon-tbn?q=tbn:ANd9GcSOsSxW7umbBSK5Lb66TAGyB9y0s9JDnkeNfe5yC2F_OLCPcjtz_HrSyT5YyNfvRje24WOVxgmKU8D4u5YQVATDI8d3CdvmyBRFtoN_9zRqFQFfLsACqwxBH7riNNRT378",
      price: 768.41,
      thumbnail:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnuLd_yd37ygzWJRUfoAWVwY5VpYxJkyxFhtnmocqDLnarUcEs",
      in_stock: true,
    },
    {
      position: 32,
      title: "Poltrona Sicília Cor Carvalho - 1348CA-417 1348CA-417",
      link: "https://www.decoros.com.br/poltrona-sicilia-cor-carvalho-1348ca-417",
      source: "Decoros",
      source_icon:
        "https://encrypted-tbn0.gstatic.com/favicon-tbn?q=tbn:ANd9GcSLeGGO04t2dczMjl_0yqXQ92zTglbvEwJeA92b9FrUj8H_Nt08vb9j9ipx0U4HM627LD7J5XuQWzMqfB6GFzByM5mf3RbUhT-NCo2Mi97ttWSsF7Fa_Ak",
      price: 800.99,
      thumbnail:
        "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcR9EhKy2MQtBmLMvHHdGCDUabggrsqZhyZgBFwMd3hErzEt3iVx",
      in_stock: true,
    },
    {
      position: 51,
      title: "Cadeira Tosar I Amêndoa Com Lyz",
      link: "https://www.mobly.com.br/cadeira-tosar-i-amendoa-com-lyz-551949.html",
      source: "Mobly",
      source_icon:
        "https://encrypted-tbn1.gstatic.com/favicon-tbn?q=tbn:ANd9GcSgkEdSvp628-UWjQH_24X0O1yWKFiTbSGSO0mYYEUjl9TadiRy7rxO07-IXimRiDWWJ_phBW8C7B4rNLCG7Koqw60McFgKBOVfVoPIRT60mK6MOFgs",
      price: 901.99,
      thumbnail:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqkoB5X0UQykE11aXyLSbjp3L6R10dzDTs2DZDBo5r4pUNepO1",
      in_stock: true,
    },
    {
      position: 55,
      title: "Cadeira Tosar I Amêndoa Grafite",
      link: "https://www.mobly.com.br/cadeira-tosar-i-amendoa-grafite-551950.html",
      source: "Mobly",
      source_icon:
        "https://encrypted-tbn1.gstatic.com/favicon-tbn?q=tbn:ANd9GcSgkEdSvp628-UWjQH_24X0O1yWKFiTbSGSO0mYYEUjl9TadiRy7rxO07-IXimRiDWWJ_phBW8C7B4rNLCG7Koqw60McFgKBOVfVoPIRT60mK6MOFgs",
      price: 901.99,
      thumbnail:
        "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRCxMQGoS9ZXcLITLAXCnXwWKelhrMEvDpknQemy0erEibPk7q6",
      in_stock: true,
    },
    {
      position: 13,
      block_position: "bottom",
      title:
        "Poltrona Decorativa Para Sala De Estar Pietra L02 Couríssimo Camel Linho Bege Escuro - Lyam Decor",
      price: 903.51,
      extracted_price: 903.51,
      link: "https://www.google.com.br/aclk?sa=l&ai=DChcSEwjUzbK9seOHAxVvNK0GHcbHGq4YABAZGgJwdg&co=1&ase=2&gclid=EAIaIQobChMI1M2yvbHjhwMVbzStBh3GxxquEAsYAyABEgKCvvD_BwE&sig=AOD64_1DwQvpqN8R97UAhRCjDNFyzMHxJQ&ctype=5&q=&nis=4&ved=0ahUKEwik4Ku9seOHAxV3KUQIHdUNDTwQ9A4I_w4&adurl=",
      source: "lyam decor",
      rating: 4.5,
      reviews: 3,
      thumbnail:
        "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTfinvKeIlQIh8rYiawjoM9BhZkmry7CVqV8DOMMdKphTZO0heIHes9ycKshQJfUxzR6itD3NZnpf_RjKXEAWcRQBehgYdiNLc6NdmpRbk&usqp=CAE",
    },
    {
      position: 5,
      block_position: "top",
      title:
        "Poltrona Para Sala De Estar Pietra Camel Linho Bege Escuro - Bege",
      price: 943.9,
      extracted_price: 943.9,
      link: "https://www.google.com.br/aclk?sa=l&ai=DChcSEwjUzbK9seOHAxVvNK0GHcbHGq4YABAJGgJwdg&co=1&ase=2&gclid=EAIaIQobChMI1M2yvbHjhwMVbzStBh3GxxquEAQYBSABEgJnYvD_BwE&sig=AOD64_1Bx4FOT0MTNNaMA-EiO43-ldiiSA&ctype=5&q=&nis=4&ved=0ahUKEwik4Ku9seOHAxV3KUQIHdUNDTwQww8InAg&adurl=",
      source: "casas bahia",
      thumbnail:
        "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSCHI_zKVY-sJ4uYT_GQWz5fjpJFjGPGKXA_Dkng-ANc56zV6jGbv-gHWYDNkSwkV1-P64gzGlpBrP-N28d3FG4-lQFS_wQy-uOb7Ih7U0v&usqp=CAE",
    },
    {
      position: 10,
      block_position: "top",
      title:
        "Poltrona Decorativa Para Sala De Estar Pietra L02 Couríssimo Camel Linho Bege Escuro - Lyam Decor",
      price: 943.9,
      extracted_price: 943.9,
      link: "https://www.google.com.br/aclk?sa=l&ai=DChcSEwjUzbK9seOHAxVvNK0GHcbHGq4YABATGgJwdg&co=1&ase=2&gclid=EAIaIQobChMI1M2yvbHjhwMVbzStBh3GxxquEAQYCiABEgKVSvD_BwE&sig=AOD64_3x-qw5X2QLQexhfx97DEWMgC3JDA&ctype=5&q=&nis=4&ved=0ahUKEwik4Ku9seOHAxV3KUQIHdUNDTwQww8IrAg&adurl=",
      source: "madeiramadeira",
      rating: 4.5,
      reviews: 11,
      thumbnail:
        "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcTCeyCg1OceZpGV4c-w-1fsMkQfMbe3kz0K-_RmVaPhTfx2QhJY0xW_PI-UV70myV73FsVdWOFPhsX9h4HylIt4AW_AA5yaLS-uL5z--XbL&usqp=CAE",
    },
    {
      position: 12,
      block_position: "bottom",
      title:
        "Poltrona Para Sala De Estar Pietra Camel Linho Bege Escuro | Lyam Decor",
      price: 943.9,
      extracted_price: 943.9,
      link: "https://www.google.com.br/aclk?sa=l&ai=DChcSEwjUzbK9seOHAxVvNK0GHcbHGq4YABAXGgJwdg&co=1&ase=2&gclid=EAIaIQobChMI1M2yvbHjhwMVbzStBh3GxxquEAsYAiABEgKQPfD_BwE&sig=AOD64_15d6BjdXsuLoncJOo6uYgg8mebcQ&ctype=5&q=&nis=4&ved=0ahUKEwik4Ku9seOHAxV3KUQIHdUNDTwQ9A4I_A4&adurl=",
      source: "camicado",
      thumbnail:
        "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTEFv5qC7XmI9Cc85YlhjqmvwMD7mX_TYtN3y13h6digrBORY15MDZKCkvgq0llMGA0GOjyxeICU-jcUBYqPTArW6UMFaSauWTQqrc_HzE&usqp=CAE",
    },
    {
      position: 8,
      block_position: "top",
      title:
        "Poltrona Decorativa Para Sala De Estar Pietra L02 Couríssimo Camel Linho Bege Escuro - Lyam Decor",
      price: 944.01,
      extracted_price: 944.01,
      link: "https://www.google.com.br/aclk?sa=l&ai=DChcSEwjUzbK9seOHAxVvNK0GHcbHGq4YABAPGgJwdg&co=1&ase=2&gclid=EAIaIQobChMI1M2yvbHjhwMVbzStBh3GxxquEAQYCCABEgIFwfD_BwE&sig=AOD64_0bsYnKMxdb0zxXWWf2B28qw_RJSg&ctype=5&q=&nis=4&ved=0ahUKEwik4Ku9seOHAxV3KUQIHdUNDTwQww8IpQg&adurl=",
      source: "americanas.com",
      thumbnail:
        "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTg8P-ihWQijvtE2lYkIYtTlluiHYs6vKU1T2jTgBggeLICrCwrDdmK5bFdPR9MQBIJO5PWNbip9PfVf25KsEFJHyKNsYs2qJoGS-d307PY&usqp=CAE",
    }
  ];

  offers = offers.sort((a: any, b: any) => a.price - b.price);

  const image_feature_extractor = await pipeline(
    "image-feature-extraction",
    "Xenova/clip-vit-base-patch32"
  );

  const featureScraped = await image_feature_extractor(imageUrl);
  const scrapedImgEmbed = Array.from(featureScraped.data);

  for (let i = 0; i < offers.length && similarOffers.length < 1; i++) {
    let offerFeatureScraped = await image_feature_extractor(
      offers[i].thumbnail
    );
    offersImageEmbeds[i] = Array.from(offerFeatureScraped.data);
    const similarity = cosineSimilarity(scrapedImgEmbed, offersImageEmbeds[i]);
    console.log(similarity + " - " + offers[i].title);
    if (similarity > 0.87) {
      similarOffers.push(offers[i]);
    }
  }

  return Response.json([similarOffers]);
}
