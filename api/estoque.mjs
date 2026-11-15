
export default {
  async fetch(request) {

    if (request.method !== "GET") {
      return Response.json(
        { erro: "Metodo nao permitido" },
        { status: 405 }
      );
    }

    const chave = process.env.THINGSPEAK_READ_API_KEY;

    if (!chave) {
      return Response.json(
        { erro: "Chave nao configurada no Vercel" },
        { status: 500 }
      );
    }

    const url = new URL(
      "https://api.thingspeak.com/channels/3579559/fields/1/last.json"
    );

    url.searchParams.set("api_key", chave);

    try {
      const resposta = await fetch(url, {
        cache: "no-store",
        signal: AbortSignal.timeout(8000)
      });

      if (!resposta.ok) {
        throw new Error("Falha na consulta");
      }

      const dados = await resposta.json();
      const quantidade = Number(dados.field1);

      if (!Number.isInteger(quantidade) || quantidade < 0) {
        return Response.json(
          { erro: "Quantidade invalida ou indisponivel" },
          { status: 502 }
        );
      }

      return Response.json(
        {
          produto: "Oleo 556 Radnaq 500 ml",
          quantidade: quantidade,
          atualizadoEm: dados.created_at,
          registro: dados.entry_id
        },
        {
          headers: {
            "Cache-Control": "no-store"
          }
        }
      );

    } catch (erro) {
      return Response.json(
        { erro: "Nao foi possivel consultar o estoque" },
        { status: 502 }
      );
    }
  }
};
