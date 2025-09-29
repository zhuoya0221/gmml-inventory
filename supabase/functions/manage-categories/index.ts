import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'list'
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Verify user authentication
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }
    
    // Check if user is admin for write operations
    if (['create', 'update', 'delete'].includes(action)) {
      const { data: requestingUserData, error: requestingUserError } = await supabaseClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (requestingUserError) throw requestingUserError

      if (requestingUserData.role !== 'admin') {
        return new Response(JSON.stringify({ error: 'Only admins can manage categories.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        })
      }
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    switch (action) {
      case 'list': {
        const { data, error } = await supabaseClient
          .from('categories')
          .select('*')
          .order('name')

        if (error) throw error

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      case 'create': {
        const { name, description } = await req.json()

        const { data, error } = await supabaseAdmin
          .from('categories')
          .insert([{ name, description, created_by: user.id }])
          .select()
          .single()

        if (error) throw error

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201,
        })
      }

      case 'update': {
        const { id, name, description } = await req.json()

        const { data, error } = await supabaseAdmin
          .from('categories')
          .update({ name, description })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      case 'delete': {
        const { id } = await req.json()

        // Check if category is in use
        const { data: itemsUsingCategory, error: checkError } = await supabaseAdmin
          .from('inventory_items')
          .select('id')
          .eq('category', (await supabaseAdmin.from('categories').select('name').eq('id', id).single()).data?.name)
          .limit(1)

        if (checkError) throw checkError

        if (itemsUsingCategory && itemsUsingCategory.length > 0) {
          return new Response(JSON.stringify({ error: 'Cannot delete category that is in use by inventory items' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          })
        }

        const { error } = await supabaseAdmin
          .from('categories')
          .delete()
          .eq('id', id)

        if (error) throw error

        return new Response(JSON.stringify({ message: 'Category deleted successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
