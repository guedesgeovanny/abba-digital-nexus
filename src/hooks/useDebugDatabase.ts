
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export const useDebugDatabase = () => {
  const [loading, setLoading] = useState(false)

  const checkTableStructure = async () => {
    try {
      setLoading(true)
      console.log('=== VERIFICANDO ESTRUTURA DA TABELA PROFILES ===')
      
      // Verificar se a tabela existe
      const { data: tables, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'profiles')

      if (tableError) {
        console.error('Erro ao verificar tabela:', tableError)
        return
      }

      console.log('Tabela profiles existe:', tables?.length > 0)

      // Verificar colunas da tabela
      const { data: columns, error: columnError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_schema', 'public')
        .eq('table_name', 'profiles')
        .order('ordinal_position')

      if (columnError) {
        console.error('Erro ao verificar colunas:', columnError)
        return
      }

      console.log('Colunas da tabela profiles:', columns)

      // Verificar dados existentes
      const { data: profiles, error: dataError } = await supabase
        .from('profiles')
        .select('*')
        .limit(5)

      if (dataError) {
        console.error('Erro ao buscar dados:', dataError)
        return
      }

      console.log('Dados de exemplo da tabela profiles:', profiles)

      // Verificar políticas RLS
      const { data: policies, error: policyError } = await supabase
        .from('pg_policies')
        .select('policyname, cmd, roles, qual, with_check')
        .eq('tablename', 'profiles')

      if (policyError) {
        console.error('Erro ao verificar políticas:', policyError)
        return
      }

      console.log('Políticas RLS da tabela profiles:', policies)

    } catch (error) {
      console.error('Erro geral ao verificar estrutura:', error)
    } finally {
      setLoading(false)
    }
  }

  const testUserOperations = async () => {
    try {
      setLoading(true)
      console.log('=== TESTANDO OPERAÇÕES DE USUÁRIO ===')
      
      const testUser = {
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'viewer' as const,
        status: 'active' as const
      }

      // Teste de inserção
      console.log('Testando inserção...')
      const { data: insertData, error: insertError } = await supabase
        .from('profiles')
        .insert([testUser])
        .select()

      if (insertError) {
        console.error('Erro na inserção:', insertError)
      } else {
        console.log('Inserção bem-sucedida:', insertData)
      }

      // Teste de atualização
      if (insertData && insertData[0]) {
        console.log('Testando atualização...')
        const { data: updateData, error: updateError } = await supabase
          .from('profiles')
          .update({ full_name: 'Test User Updated' })
          .eq('id', insertData[0].id)
          .select()

        if (updateError) {
          console.error('Erro na atualização:', updateError)
        } else {
          console.log('Atualização bem-sucedida:', updateData)
        }

        // Limpeza - deletar usuário de teste
        await supabase
          .from('profiles')
          .delete()
          .eq('id', insertData[0].id)
      }

    } catch (error) {
      console.error('Erro geral ao testar operações:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    checkTableStructure,
    testUserOperations
  }
}
