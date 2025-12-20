-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'client');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role app_role NOT NULL DEFAULT 'client',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table for proper role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Planning',
  progress INTEGER NOT NULL DEFAULT 0,
  designer TEXT,
  start_date DATE,
  estimated_completion DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create mood_boards (inspirations) table
CREATE TABLE public.mood_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create mood_board_images table
CREATE TABLE public.mood_board_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mood_board_id UUID REFERENCES public.mood_boards(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create design_items table (materials/fixtures in mood boards)
CREATE TABLE public.design_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mood_board_id UUID REFERENCES public.mood_boards(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  image_url TEXT,
  link TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create design_item_comments table
CREATE TABLE public.design_item_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_item_id UUID REFERENCES public.design_items(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create renderings table
CREATE TABLE public.renderings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  room TEXT,
  image_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create rendering_comments table
CREATE TABLE public.rendering_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rendering_id UUID REFERENCES public.renderings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create messages table for project chat
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create product_inventory table
CREATE TABLE public.product_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  supplier TEXT,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create milestones table
CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming',
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_board_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_item_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renderings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rendering_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    'client'
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mood_boards_updated_at BEFORE UPDATE ON public.mood_boards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_renderings_updated_at BEFORE UPDATE ON public.renderings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for projects
CREATE POLICY "Clients can view own projects" ON public.projects FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Admins can view all projects" ON public.projects FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create projects" ON public.projects FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update projects" ON public.projects FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete projects" ON public.projects FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for documents
CREATE POLICY "Clients can view sent/archived docs" ON public.documents FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND client_id = auth.uid()) AND status IN ('sent', 'archived')
);
CREATE POLICY "Admins can view all documents" ON public.documents FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage documents" ON public.documents FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for mood_boards
CREATE POLICY "Clients can view own mood boards" ON public.mood_boards FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND client_id = auth.uid())
);
CREATE POLICY "Admins can manage mood boards" ON public.mood_boards FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for mood_board_images
CREATE POLICY "Clients can view mood board images" ON public.mood_board_images FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.mood_boards mb JOIN public.projects p ON mb.project_id = p.id WHERE mb.id = mood_board_id AND p.client_id = auth.uid())
);
CREATE POLICY "Admins can manage mood board images" ON public.mood_board_images FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for design_items
CREATE POLICY "Clients can view design items" ON public.design_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.mood_boards mb JOIN public.projects p ON mb.project_id = p.id WHERE mb.id = mood_board_id AND p.client_id = auth.uid())
);
CREATE POLICY "Admins can manage design items" ON public.design_items FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for design_item_comments
CREATE POLICY "Users can view comments on accessible items" ON public.design_item_comments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.design_items di 
    JOIN public.mood_boards mb ON di.mood_board_id = mb.id 
    JOIN public.projects p ON mb.project_id = p.id 
    WHERE di.id = design_item_id AND (p.client_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);
CREATE POLICY "Users can add comments" ON public.design_item_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.design_item_comments FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for renderings
CREATE POLICY "Clients can view own renderings" ON public.renderings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND client_id = auth.uid())
);
CREATE POLICY "Clients can update renderings" ON public.renderings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND client_id = auth.uid())
);
CREATE POLICY "Admins can manage renderings" ON public.renderings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for rendering_comments
CREATE POLICY "Users can view rendering comments" ON public.rendering_comments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.renderings r 
    JOIN public.projects p ON r.project_id = p.id 
    WHERE r.id = rendering_id AND (p.client_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);
CREATE POLICY "Users can add rendering comments" ON public.rendering_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own rendering comments" ON public.rendering_comments FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Users can view project messages" ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE id = project_id AND (client_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- RLS Policies for product_inventory
CREATE POLICY "Admins can manage inventory" ON public.product_inventory FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Clients can view inventory for their projects" ON public.product_inventory FOR SELECT USING (
  project_id IS NULL OR EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND client_id = auth.uid())
);

-- RLS Policies for milestones
CREATE POLICY "Clients can view own milestones" ON public.milestones FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND client_id = auth.uid())
);
CREATE POLICY "Admins can manage milestones" ON public.milestones FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;