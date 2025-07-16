
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export const useDebugDatabase = () => {
  const [loading, setLoading] = useState(false)

  const checkTableStructure = async () => {
    try {
      setLoading(true)
      console.log('=== VERIFICANDO ESTRUTURA DA TABELA PROFILES ===')
      
      // Verificar se a tabela existe usando SQL bruto
      const { data: tableExists, error: tableError } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles'
          ) as exists;
        `
      }).catch(async () => {
        // Se rpc não funcionar, usar uma query simples na tabela
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .limit(1)
        return { data: data ? [{ exists: true }] : [{ exists: false }], error }
      })

      if (tableError) {
        console.error('Erro ao verificar tabela:', tableError)
      } else {
        console.log('Tabela profiles existe:', tableExists)
      }

      // Verificar colunas usando SQL bruto
      const { data: columns, error: columnError } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'profiles'
          ORDER BY ordinal_position;
        `
      }).catch(async () => {
        // Fallback: tentar buscar dados da tabela para ver estrutura
        console.log('Usando fallback para verificar estrutura...')
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(1)
        
        if (data && data.length > 0) {
          const sampleRow = data[0]
          const columnInfo = Object.keys(sampleRow).map(key => ({
            column_name: key,
            data_type: typeof sampleRow[key],
            value_example: sampleRow[key]
          }))
          return { data: columnInfo, error: null }
        }
        return { data: null, error }
      })

      if (columnError) {
        console.error('Erro ao verificar colunas:', columnError)
      } else {
        console.log('Colunas da tabela profiles:', columns)
      }

      // Verificar dados existentes
      const { data: profiles, error: dataError } = await supabase
        .from('profiles')
        .select('*')
        .limit(5)

      if (dataError) {
        console.error('Erro ao buscar dados:', dataError)
      } else {
        console.log('Dados de exemplo da tabela profiles:', profiles)
      }

      // Verificar políticas RLS usando SQL bruto se possível
      const { data: policies, error: policyError } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT policyname, cmd, roles, qual, with_check
          FROM pg_policies 
          WHERE tablename = 'profiles';
        `
      }).catch(() => {
        console.log('Não foi possível verificar políticas RLS (permissões insuficientes)')
        return { data: null, error: null }
      })

      if (policyError) {
        console.error('Erro ao verificar políticas:', policyError)
      } else if (policies) {
        console.log('Políticas RLS da tabela profiles:', policies)
      }

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
      
      // Usar um ID UUID válido para teste
      const testUserId = crypto.randomUUID()
      
      const testUser = {
        id: testUserId,
        email: 'test@example.com',
        full_name: 'Test User'
      }

      // Teste de inserção usando qualquer objeto (sem tipagem estrita)
      console.log('Testando inserção...')
      const { data: insertData, error: insertError } = await supabase
        .from('profiles' as any)
        .insert([testUser])
        .select()

      if (insertError) {
        console.error('Erro na inserção:', insertError)
        console.error('Detalhes do erro:', insertError.message)
        console.error('Código do erro:', insertError.code)
      } else {
        console.log('Inserção bem-sucedida:', insertData)
      }

      // Teste de atualização se a inserção funcionou
      if (insertData && insertData[0]) {
        console.log('Testando atualização...')
        const { data: updateData, error: updateError } = await supabase
          .from('profiles')
          .update({ full_name: 'Test User Updated' })
          .eq('id', insertData[0].id)
          .select()

        if (updateError) {
          console.error('Erro na atualização:', updateError)
          console.error('Detalhes do erro:', updateError.message)
          console.error('Código do erro:', updateError.code)
        } else {
          console.log('Atualização bem-sucedida:', updateData)
        }

        // Limpeza - deletar usuário de teste
        console.log('Limpando dados de teste...')
        const { error: deleteError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', insertData[0].id)

        if (deleteError) {
          console.error('Erro ao limpar dados de teste:', deleteError)
        } else {
          console.log('Dados de teste removidos com sucesso')
        }
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
