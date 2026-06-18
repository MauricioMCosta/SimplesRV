export function fromText(cnpj: string): string {
  return cnpj.replace(/\W/g, '').replace('_','');
}

export function toText(cnpj: string): string {
  const digits = fromText(cnpj);
  if (digits.length !== 14) return digits;
  return digits.replace(
    /^(\w{2})(\w{3})(\w{3})(\w{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

export function isValidCNPJ(cnpj: string): boolean {

  const asciiMap=(s:string)=>s.toUpperCase().split('').map(c=>c.charCodeAt(0)-48);
  const dotProduct=(a:number[],b:number[])=>a.reduce((sum:number, val:number, i:number) => sum + val * b[i], 0);
  const dv=(n:number)=>{let v=n %11; return v<2?0:11-v;}

  const digits = fromText(cnpj);

  if (digits.length !== 14) return false;

  const cnpjx=asciiMap(digits).slice(0,12); 

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const dv1 = dv(dotProduct([...cnpjx], weights1));
  const dv2 = dv(dotProduct([...cnpjx,dv1], weights2));

  return (
    dv1 === parseInt(digits[12]) && dv2 === parseInt(digits[13])
  );
}
