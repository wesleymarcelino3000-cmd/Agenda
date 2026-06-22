import { supabase } from './supabase';
export async function listRows<T>(table:string, order='created_at'){const {data,error}=await supabase.from(table).select('*').order(order,{ascending:false}); if(error) throw error; return data as T[];}
export async function createRow<T>(table:string,payload:Record<string,unknown>){const {data,error}=await supabase.from(table).insert(payload).select('*').single(); if(error) throw error; return data as T;}
export async function updateRow<T>(table:string,id:string,payload:Record<string,unknown>){const {data,error}=await supabase.from(table).update(payload).eq('id',id).select('*').single(); if(error) throw error; return data as T;}
export async function deleteRow(table:string,id:string){const {error}=await supabase.from(table).delete().eq('id',id); if(error) throw error;}
