const createClient = require("@supabase/supabase-js");

// Create a single supabase client for interacting with your database
const supabase = createClient(
  "https://etqzloikgowvgpitntde.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0cXpsb2lrZ293dmdwaXRudGRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY5NTUwNjYsImV4cCI6MjA0MjUzMTA2Nn0._uHKRITNGYId01hrBLGQrtr2w_T_S97DJW7mu8jgYak"
);

const funcao = async () => {
  let { data: recommended, error } = await supabase
    .from("recommended")
    .select("*");

  console.log(recommended);
};

funcao();