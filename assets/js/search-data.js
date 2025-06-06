// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-blog",
          title: "blog",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "nav-projects",
          title: "projects",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-repositories",
          title: "repositories",
          description: "Edit the `_data/repositories.yml` and change the `github_users` and `github_repos` lists to include your own GitHub profile and repositories.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/repositories/";
          },
        },{id: "post-efficient-streaming-language-models-with-attention-sinks",
        
          title: "Efficient Streaming Language Models with Attention Sinks",
        
        description: "Efficient Streaming Language Models with Attention Sinks을 읽고 논문을 정리한 글입니다.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/Efficient-Streaming-Language-Models-with-Attention-Sinks/";
          
        },
      },{id: "post-eie-efficient-inference-engine-on-compressed-deep-neural-network",
        
          title: "EIE-Efficient Inference Engine on Compressed Deep Neural Network",
        
        description: "EIE-Efficient Inference Engine on Compressed Deep Neural Network을 읽고 논문을 정리한 글입니다.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/EIE/";
          
        },
      },{id: "post-pruning-ratio",
        
          title: "Pruning Ratio",
        
        description: "Pruning Ratio를 다루는 글입니다. 본 글은 MT Tiny ML and Efficiency Deep Learning Computing Lecture를 듣고 작성하였습니다.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/Pruning-Ratio/";
          
        },
      },{id: "post-what-is-pruning",
        
          title: "What is Pruning",
        
        description: "Pruning의 개요를 다루는 글입니다. 본 글은 MT Tiny ML and Efficiency Deep Learning Computing Lecture를 듣고 작성하였습니다.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/What-is-Pruning/";
          
        },
      },{id: "post-pruning-with-fine-tuning",
        
          title: "Pruning with Fine-tuning",
        
        description: "Pruning with Fine-tuning을 다루는 글입니다. 본 글은 MT Tiny ML and Efficiency Deep Learning Computing Lecture를 듣고 작성하였습니다.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/Pruning-with-Fine-tuning/";
          
        },
      },{id: "post-pruning-granularity",
        
          title: "Pruning Granularity",
        
        description: "Pruning Granularity를 다루는 글입니다. 본 글은 MT Tiny ML and Efficiency Deep Learning Computing Lecture를 듣고 작성하였습니다.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/Pruning-Granularity/";
          
        },
      },{id: "post-pruning-criterion",
        
          title: "Pruning Criterion",
        
        description: "Pruning Criterion을 다루는 글입니다. 본 글은 MT Tiny ML and Efficiency Deep Learning Computing Lecture를 듣고 작성하였습니다.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/Pruning-Criterion/";
          
        },
      },{
        id: 'social-discord',
        title: 'Discord',
        section: 'Socials',
        handler: () => {
          window.open("https://discord.com/users/msh1217", "_blank");
        },
      },{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%61%6C%73%74%6E%67%68%64%37%37@%67%6D%61%69%6C.%63%6F%6D", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/iamjames77", "_blank");
        },
      },{
        id: 'social-instagram',
        title: 'Instagram',
        section: 'Socials',
        handler: () => {
          window.open("https://instagram.com/suhongmim", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/수홍-민-835208254", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
