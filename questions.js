/* =========================================================
   QUIZSMITH · QUESTION BANK
   Each option is [text, weight]:
     1    = fully correct
     0.5  = close (right idea, wrong detail)
     0.25 = related near-miss
     0    = wrong
   d = difficulty (1 easy, 2 medium, 3 hard) = points the question is worth.
   x = explanation shown on the result card.
   ========================================================= */

const TOPICS = {
  WEB: {
    name: 'Web Technologies', short: 'Web', glyph: '</>',
    tiers: ['View Source', 'Front-end Dev', 'Full-stack Dev', 'Web Architect'],
    qs: [
      { q: 'What does HTML stand for?', d: 1, o: [['HyperText Markup Language', 1], ['HyperText Machine Language', 0.25], ['HighText Markup Language', 0.25], ['Hyperlink Transfer Markup Language', 0]], x: 'HTML is the markup language that describes the structure of a web page.' },
      { q: 'Which CSS declaration turns an element into a flex container?', d: 1, o: [['display: flex', 1], ['flex: 1', 0.25], ['position: flex', 0], ['float: flex', 0]], x: 'display: flex makes the element a flex container. flex: 1 is set on the children (flex items).' },
      { q: 'Which CSS unit is relative to the root element’s font size?', d: 1, o: [['rem', 1], ['em', 0.5], ['vh', 0], ['px', 0]], x: 'rem = root em. Plain em is relative to the current element’s font size, which compounds when nested.' },
      { q: 'What is the DOM?', d: 1, o: [['A tree of objects representing the page that scripts can read and change', 1], ['The browser’s JavaScript engine', 0.25], ['A CSS layout algorithm', 0], ['A server-side database', 0]], x: 'The Document Object Model is the live, tree-shaped API for the page. V8 or SpiderMonkey is the JS engine.' },
      { q: 'Which HTTP method is idempotent and used to fully replace a resource?', d: 2, o: [['PUT', 1], ['PATCH', 0.5], ['POST', 0], ['CONNECT', 0]], x: 'PUT replaces the whole resource, and repeating it gives the same result. PATCH applies a partial update and isn’t guaranteed idempotent.' },
      { q: 'In JavaScript, what does typeof null return?', d: 2, o: [['"object"', 1], ['"null"', 0.25], ['"undefined"', 0.25], ['"number"', 0]], x: 'A famous bug from JavaScript’s first version, kept for backwards compatibility.' },
      { q: 'Which status code means the request lacks valid authentication?', d: 2, o: [['401 Unauthorized', 1], ['403 Forbidden', 0.5], ['407 Proxy Authentication Required', 0.25], ['400 Bad Request', 0]], x: '401 means “who are you?”. 403 means “I know who you are, and the answer is no”.' },
      { q: 'What does CORS control?', d: 2, o: [['Whether a browser lets a page read responses from another origin', 1], ['Whether a server may call other servers', 0.25], ['Whether cookies are encrypted', 0], ['Which ports a server listens on', 0]], x: 'Cross-Origin Resource Sharing is enforced by browsers using response headers such as Access-Control-Allow-Origin. Server-to-server calls aren’t affected.' },
      { q: 'Which selector has the highest specificity?', d: 2, o: [['#main', 1], ['.card.active', 0.25], ['div p span', 0], ['*', 0]], x: 'One ID (1,0,0) beats any number of classes (0,2,0) or element selectors (0,0,3).' },
      { q: 'What does the defer attribute on a <script> tag do?', d: 3, o: [['Downloads in parallel, then runs in order after HTML parsing finishes', 1], ['Downloads in parallel and runs as soon as it arrives', 0.25], ['Waits for the first user interaction before running', 0], ['Stops the script from running at all', 0]], x: 'The second option describes async: it runs as soon as it arrives, in any order.' },
      { q: 'What is a Service Worker mainly used for?', d: 3, o: [['Intercepting network requests to enable offline caching and push', 1], ['Running heavy computation off the main thread', 0.25], ['Server-side rendering of pages', 0], ['Compressing images on upload', 0]], x: 'It’s a proxy between the page and the network. Heavy computation is a job for a regular Web Worker.' },
      { q: 'What key feature did HTTP/2 introduce over HTTP/1.1?', d: 3, o: [['Multiplexing many requests over one TCP connection', 1], ['Running over UDP using QUIC', 0.5], ['Cookies', 0], ['Plain-text headers', 0]], x: 'HTTP/2 also added binary framing and header compression (HPACK). QUIC over UDP is HTTP/3.' }
    ]
  },

  NET: {
    name: 'Networking', short: 'Networking', glyph: '⇄',
    tiers: ['Unplugged', 'Packet Pusher', 'Network Engineer', 'Protocol Architect'],
    qs: [
      { q: 'What is the default port for HTTPS?', d: 1, o: [['443', 1], ['8443', 0.25], ['80', 0.25], ['22', 0]], x: '80 is plain HTTP, 22 is SSH, and 8443 is a common alternate HTTPS port.' },
      { q: 'At which OSI layer does IP operate?', d: 1, o: [['Layer 3: Network', 1], ['Layer 4: Transport', 0.25], ['Layer 2: Data Link', 0.25], ['Layer 7: Application', 0]], x: 'IP handles logical addressing and routing. TCP and UDP sit at Layer 4; Ethernet sits at Layer 2.' },
      { q: 'What does DNS do?', d: 1, o: [['Translates domain names into IP addresses', 1], ['Assigns IP addresses to devices', 0.25], ['Encrypts traffic', 0], ['Routes packets between networks', 0]], x: 'Assigning addresses is DHCP’s job.' },
      { q: 'Which transport protocol is connectionless?', d: 1, o: [['UDP', 1], ['QUIC', 0.25], ['TCP', 0], ['SSH', 0]], x: 'UDP has no handshake and no delivery guarantee. QUIC runs on UDP but builds its own connections on top.' },
      { q: 'What does NAT do?', d: 1, o: [['Rewrites addresses so many private hosts share one public IP', 1], ['Blocks unwanted ports', 0.25], ['Encrypts packets', 0], ['Resolves hostnames', 0]], x: 'Network Address Translation is why your whole home network shares one public IPv4 address. Blocking ports is a firewall’s job.' },
      { q: 'What is the order of the TCP three-way handshake?', d: 2, o: [['SYN → SYN-ACK → ACK', 1], ['SYN → ACK → SYN-ACK', 0.25], ['SYN → SYN → ACK', 0.25], ['ACK → SYN → FIN', 0]], x: 'Client sends SYN, server replies SYN-ACK, client confirms with ACK.' },
      { q: 'How many usable host addresses are in an IPv4 /24 subnet?', d: 2, o: [['254', 1], ['256', 0.5], ['255', 0.25], ['128', 0]], x: '2⁸ = 256 addresses, minus the network address and the broadcast address.' },
      { q: 'What does ARP do?', d: 2, o: [['Finds the MAC address for an IP address on the local network', 1], ['Finds the IP address for a MAC address', 0.5], ['Finds the IP address for a domain name', 0], ['Hands out IP addresses', 0]], x: 'ARP maps IP to MAC. The reverse lookup was the old RARP protocol.' },
      { q: 'Which is an RFC 1918 private IPv4 range?', d: 2, o: [['10.0.0.0/8', 1], ['100.64.0.0/10', 0.25], ['169.254.0.0/16', 0.25], ['8.8.8.0/24', 0]], x: 'The private ranges are 10/8, 172.16/12 and 192.168/16. 100.64/10 is carrier-grade NAT space; 169.254/16 is link-local.' },
      { q: 'What happens when an IP packet’s TTL reaches 0?', d: 2, o: [['It’s dropped, and an ICMP Time Exceeded is usually sent back', 1], ['It’s silently dropped', 0.5], ['It’s retransmitted', 0], ['It’s sent to the default gateway', 0]], x: 'This ICMP reply is exactly how traceroute discovers each hop.' },
      { q: 'Which routing protocol connects ISPs across the internet?', d: 3, o: [['BGP', 1], ['OSPF', 0.25], ['RIP', 0], ['EIGRP', 0]], x: 'BGP exchanges routes between autonomous systems. OSPF is an interior protocol used inside one network.' },
      { q: 'What is the standard Ethernet MTU?', d: 3, o: [['1500 bytes', 1], ['1492 bytes', 0.5], ['9000 bytes', 0.25], ['576 bytes', 0]], x: '1492 is common on PPPoE links; 9000 is the usual jumbo-frame size.' },
      { q: 'How many round trips does a full TLS 1.3 handshake take?', d: 3, o: [['1', 1], ['2', 0.5], ['0', 0.25], ['3', 0]], x: 'TLS 1.2 needed 2 round trips. 0-RTT is only possible when resuming an earlier session.' }
    ]
  },

  PY: {
    name: 'Python', short: 'Python', glyph: '>>>',
    tiers: ['import this', 'Scripter', 'Pythonista', 'Core Dev'],
    qs: [
      { q: 'Which keyword defines a function?', d: 1, o: [['def', 1], ['lambda', 0.5], ['func', 0], ['function', 0]], x: 'lambda also makes a function, but only an anonymous single-expression one.' },
      { q: 'What does print(type([])) output?', d: 1, o: [["<class 'list'>", 1], ["<class 'array'>", 0.25], ["<class 'tuple'>", 0], ["<class 'dict'>", 0]], x: '[] is an empty list; () would be a tuple and {} a dict.' },
      { q: 'What is 7 // 2?', d: 1, o: [['3', 1], ['3.5', 0.25], ['4', 0], ['1', 0]], x: '// is floor division. 7 / 2 gives 3.5 and 7 % 2 gives 1.' },
      { q: 'Which of these built-in types is immutable?', d: 1, o: [['tuple', 1], ['list', 0], ['dict', 0], ['set', 0]], x: 'Tuples can’t be changed after creation, which also lets them be used as dict keys.' },
      { q: 'What does [x * 2 for x in range(3)] produce?', d: 2, o: [['[0, 2, 4]', 1], ['[2, 4, 6]', 0.25], ['[0, 2, 4, 6]', 0.25], ['[0, 1, 2]', 0]], x: 'range(3) yields 0, 1, 2. It stops before 3.' },
      { q: 'a = [1, 2, 3]; b = a; b.append(4). What is a now?', d: 2, o: [['[1, 2, 3, 4]', 1], ['[1, 2, 3]', 0], ['[4]', 0], ['It raises an error', 0]], x: 'b = a copies the reference, not the list. Use a.copy() or list(a) for a real copy.' },
      { q: 'What does the is operator compare?', d: 2, o: [['Whether two names point to the same object', 1], ['Whether two objects have the same type', 0.25], ['Whether two values are equal', 0], ['Nothing; it’s just a faster ==', 0]], x: 'is checks identity; == checks equality. Use is for None checks.' },
      { q: 'Using yield inside a function turns it into a…', d: 2, o: [['Generator function', 1], ['Coroutine (async function)', 0.25], ['Class', 0], ['Lambda', 0]], x: 'Calling it returns a lazy iterator that resumes after each yield.' },
      { q: 'What does @staticmethod mean?', d: 2, o: [['The method receives neither the instance nor the class', 1], ['The method receives the class as its first argument', 0.5], ['The method can’t be overridden', 0], ['The method’s result is cached', 0]], x: 'Receiving the class (cls) is @classmethod.' },
      { q: 'Which command creates a virtual environment with the standard library?', d: 2, o: [['python -m venv .venv', 1], ['pip install venv', 0.25], ['python -m pip env', 0], ['python --new-env', 0]], x: 'venv has been in the standard library since Python 3.3, so nothing needs installing.' },
      { q: 'def f(a=[]): a.append(1); return a. What does a second call f() return?', d: 3, o: [['[1, 1]', 1], ['[1]', 0.25], ['None', 0], ['TypeError', 0]], x: 'Default values are evaluated once, at definition time, so the same list is reused. Use a=None and create the list inside.' },
      { q: 'What does the GIL do in standard CPython?', d: 3, o: [['Lets only one thread execute Python bytecode at a time', 1], ['Prevents using multiple processes', 0.25], ['Runs the garbage collector', 0], ['Locks modules during import', 0]], x: 'Multiprocessing sidesteps it. Python 3.13 added an optional free-threaded build without the GIL.' }
    ]
  },

  SW: {
    name: 'Software Engineering', short: 'Software', glyph: '{ }',
    tiers: ['Bug Reporter', 'Code Reviewer', 'Tech Lead', 'Software Architect'],
    qs: [
      { q: 'What is a unit test?', d: 1, o: [['A test of one small piece of code in isolation', 1], ['A test of several components working together', 0.25], ['A test of the full system end to end', 0], ['A test session with real users', 0]], x: 'Testing several components together is an integration test.' },
      { q: 'In semantic versioning (MAJOR.MINOR.PATCH), which number changes for a breaking change?', d: 1, o: [['MAJOR', 1], ['MINOR', 0.25], ['PATCH', 0], ['None; a build tag is added', 0]], x: 'MINOR is for backwards-compatible features and PATCH for fixes.' },
      { q: 'What does CI stand for in CI/CD?', d: 1, o: [['Continuous Integration', 1], ['Continuous Improvement', 0.25], ['Code Inspection', 0], ['Container Infrastructure', 0]], x: 'Every change is merged and automatically built and tested, often many times a day.' },
      { q: 'What is technical debt?', d: 1, o: [['The future cost of shortcuts taken now', 1], ['The number of open bug tickets', 0.25], ['Money owed for software licences', 0], ['The monthly cloud bill', 0]], x: 'Like financial debt, it builds up “interest” as every later change becomes slower.' },
      { q: 'Which Git command creates a new branch and switches to it?', d: 1, o: [['git switch -c feature', 1], ['git branch feature', 0.5], ['git checkout feature', 0.25], ['git merge feature', 0]], x: 'git branch only creates it. git checkout -b feature also works.' },
      { q: 'What does the “S” in SOLID stand for?', d: 2, o: [['Single Responsibility Principle', 1], ['Separation of Concerns', 0.25], ['Substitution Principle', 0.25], ['Simplicity', 0]], x: 'A class should have one reason to change. Substitution is the “L” (Liskov).' },
      { q: 'What is the average time to look up a key in a hash table?', d: 2, o: [['O(1)', 1], ['O(log n)', 0.25], ['O(n)', 0], ['O(n²)', 0]], x: 'Worst case is O(n) when many keys collide, but a good hash function makes that rare.' },
      { q: 'Which pattern ensures a class has exactly one instance?', d: 2, o: [['Singleton', 1], ['Flyweight', 0.25], ['Factory', 0], ['Observer', 0]], x: 'Flyweight shares instances to save memory but doesn’t enforce a single one.' },
      { q: 'What is the Observer pattern?', d: 2, o: [['Subscribers are notified automatically when a subject changes', 1], ['A queue that buffers messages between services', 0.25], ['An object that wraps another to add behaviour', 0], ['A method that creates objects without naming their class', 0]], x: 'The other options describe a message queue, the Decorator pattern and the Factory pattern.' },
      { q: 'An operation is idempotent when…', d: 2, o: [['Running it many times has the same effect as running it once', 1], ['It has no side effects at all', 0.25], ['It always returns the same output for any input', 0.25], ['It can be undone', 0]], x: 'Setting x = 5 is idempotent; incrementing x is not. No side effects at all describes a pure function.' },
      { q: 'What does Conway’s law say?', d: 3, o: [['A system’s design mirrors the communication structure of the organisation that built it', 1], ['Adding people to a late project makes it later', 0.25], ['Work expands to fill the time available', 0], ['Transistor counts double about every two years', 0]], x: '“Adding people makes it later” is Brooks’s law, from The Mythical Man-Month.' },
      { q: 'What does the Liskov Substitution Principle require?', d: 3, o: [['A subtype must work anywhere its base type is expected', 1], ['Code should depend on abstractions, not concrete classes', 0.25], ['Many small interfaces are better than one large one', 0.25], ['Classes should be open for extension, closed for modification', 0]], x: 'The other three are Dependency Inversion, Interface Segregation and Open/Closed.' },
      { q: 'In a blue-green deployment, you…', d: 3, o: [['Run two identical environments and switch all traffic from old to new', 1], ['Release to a small percentage of users first', 0.5], ['Roll out the change one server at a time', 0.25], ['Deploy only outside business hours', 0]], x: 'Rollback means switching traffic back. A small percentage first is a canary release; one server at a time is a rolling update.' }
    ]
  },

  LINUX: {
    name: 'Linux', short: 'Linux', glyph: '$_',
    tiers: ['Live USB', 'Shell User', 'Sysadmin', 'Kernel Hacker'],
    qs: [
      { q: 'Which command lists files, including hidden ones?', d: 1, o: [['ls -a', 1], ['ls -l', 0.25], ['ls -h', 0], ['dir /a', 0]], x: 'Hidden files start with a dot. ls -l shows details, and ls -la combines both.' },
      { q: 'Which directory holds system-wide configuration files?', d: 1, o: [['/etc', 1], ['/var', 0.25], ['/usr', 0], ['/bin', 0]], x: '/var holds changing data such as logs and caches.' },
      { q: 'What does grep do?', d: 1, o: [['Prints lines that match a pattern', 1], ['Finds files by name', 0.25], ['Replaces text in a stream', 0.25], ['Compresses files', 0]], x: 'Finding files by name is find; replacing text in a stream is sed.' },
      { q: 'What does the | operator do in a shell?', d: 1, o: [["Sends one command's output into the next command's input", 1], ['Writes output to a file', 0.25], ['Runs the next command only if the first fails', 0.25], ['Runs a command in the background', 0]], x: 'Writing to a file is >, “only if it fails” is ||, and background is &.' },
      { q: 'What does sudo do?', d: 1, o: [['Runs a command as another user, root by default', 1], ['Switches you into another user’s shell', 0.5], ['Updates installed packages', 0], ['Shuts the system down', 0]], x: 'Switching into another user’s shell is su.' },
      { q: 'Which command shows live, updating CPU and memory use per process?', d: 1, o: [['top', 1], ['ps', 0.5], ['df', 0], ['lsof', 0]], x: 'ps gives a one-time snapshot; df shows disk space.' },
      { q: 'What does chmod 755 file set?', d: 2, o: [['Owner rwx, group r-x, others r-x', 1], ['Owner rwx, group rwx, others r-x', 0.25], ['Owner rw-, group r--, others r--', 0], ['rwx for everyone', 0]], x: '7 = 4+2+1 (rwx) and 5 = 4+1 (r-x). The other options are 775, 644 and 777.' },
      { q: 'On most modern distributions, what runs as PID 1?', d: 2, o: [['systemd', 1], ['SysV init', 0.5], ['kthreadd', 0.25], ['bash', 0]], x: 'Older systems used SysV init. kthreadd is PID 2, the parent of kernel threads.' },
      { q: 'Which signal does kill -9 send?', d: 2, o: [['SIGKILL', 1], ['SIGTERM', 0.25], ['SIGINT', 0], ['SIGHUP', 0]], x: 'SIGKILL can’t be caught or ignored. Plain kill sends SIGTERM by default.' },
      { q: 'What does 2>&1 do in a shell command?', d: 2, o: [['Sends stderr to wherever stdout is going', 1], ['Sends stdout to stderr', 0.25], ['Runs two commands in sequence', 0], ['Repeats the command twice', 0]], x: 'File descriptor 2 is stderr and 1 is stdout. Order matters: cmd > log 2>&1 puts both in log.' },
      { q: 'Which file lists filesystems to mount at boot?', d: 2, o: [['/etc/fstab', 1], ['/etc/mtab', 0.5], ['/etc/hosts', 0], ['/boot/grub/grub.cfg', 0]], x: '/etc/mtab lists what is mounted right now.' },
      { q: 'What is an inode?', d: 3, o: [["A structure holding a file's metadata and data locations, but not its name", 1], ['A directory entry linking a name to a file', 0.25], ['A loadable kernel module', 0], ['A running process', 0]], x: 'A directory entry is what maps a name to an inode number.' },
      { q: 'What is true of a hard link?', d: 3, o: [['It points to the same inode, so the data survives if the original name is deleted', 1], ['It stores the path to its target', 0.25], ['It can point to a file on another filesystem', 0], ['It is the usual way to link directories', 0]], x: 'Storing a path and crossing filesystems describe symbolic links.' }
    ]
  }
};

TOPICS.AI = {
  name: 'AI & Machine Learning', short: 'AI', glyph: '∇',
  tiers: ['Prompt Tinkerer', 'Model Trainer', 'ML Engineer', 'AI Researcher'],
  qs: [
    { q: 'What does “LLM” stand for?', d: 1, o: [['Large Language Model', 1], ['Large Logic Module', 0.25], ['Linear Learning Machine', 0], ['Low-Latency Model', 0]], x: 'LLMs are neural networks trained on huge amounts of text to predict the next token.' },
    { q: 'Supervised learning trains a model on…', d: 1, o: [['Labelled examples: inputs paired with known answers', 1], ['Unlabelled data, finding structure on its own', 0.25], ['Rewards earned by acting in an environment', 0.25], ['Hand-written if/then rules', 0]], x: 'Unlabelled data is unsupervised learning; learning from rewards is reinforcement learning.' },
    { q: 'What is overfitting?', d: 1, o: [['The model memorises the training data and does poorly on new data', 1], ['The model is too simple to capture the pattern', 0.25], ['Training takes too long to finish', 0], ['The dataset is too large for memory', 0]], x: 'A model that is too simple is underfitting. The usual fixes for overfitting are more data, regularisation and early stopping.' },
    { q: 'Which of these is a classification task?', d: 1, o: [['Deciding whether an email is spam', 1], ['Predicting a house’s sale price', 0.25], ['Grouping customers with no labels', 0.25], ['Compressing an image', 0]], x: 'Classification predicts a category. Predicting a price is regression; grouping without labels is clustering.' },
    { q: 'In an LLM, what is a token?', d: 1, o: [['A chunk of text, often a word or part of a word, processed as one unit', 1], ['Always exactly one character', 0.25], ['The API key used to call the model', 0], ['One unit of GPU memory', 0]], x: 'Tokenisers split text into sub-word pieces. Context limits and pricing are counted in tokens.' },
    { q: 'Which mechanism is at the heart of the Transformer architecture?', d: 2, o: [['Self-attention', 1], ['Recurrence, as in RNNs', 0.25], ['Convolution', 0.25], ['Decision trees', 0]], x: 'Introduced in “Attention Is All You Need” (2017), self-attention lets every token weigh every other token in parallel.' },
    { q: 'What does gradient descent do during training?', d: 2, o: [['Repeatedly nudges the parameters in the direction that lowers the loss', 1], ['Computes each layer’s gradients', 0.5], ['Chooses parameters at random until one works', 0], ['Raises the loss to explore more options', 0]], x: 'Computing the gradients is backpropagation; gradient descent is the update step that uses them.' },
    { q: 'What does precision measure?', d: 2, o: [['Of everything predicted positive, the share that really is positive', 1], ['Of all real positives, the share the model found', 0.5], ['The share of all predictions that were correct', 0.25], ['How fast the model makes predictions', 0]], x: 'The share of real positives found is recall; the share of all predictions correct is accuracy.' },
    { q: 'What is retrieval-augmented generation (RAG)?', d: 2, o: [['Fetching relevant documents and adding them to the prompt before generating', 1], ['Fine-tuning the model on your documents', 0.25], ['Training with human preference ratings', 0], ['A type of graph neural network', 0]], x: 'RAG grounds answers in up-to-date or private data without retraining the model.' },
    { q: 'What is an embedding?', d: 2, o: [['A vector of numbers where similar meanings sit close together', 1], ['A fixed-size hidden layer in a network', 0.25], ['A compressed copy of the training data', 0], ['A reusable prompt template', 0]], x: 'Embeddings power semantic search, recommendations and the retrieval step in RAG.' },
    { q: 'What happens when you raise the sampling temperature of an LLM?', d: 2, o: [['Outputs become more random and varied', 1], ['Outputs become more predictable', 0], ['The context window gets larger', 0], ['The model becomes more accurate', 0]], x: 'Temperature rescales the token probabilities. Near 0, the model almost always picks the most likely token.' },
    { q: 'What is RLHF used for?', d: 3, o: [['Tuning a model using human preference judgements as the reward', 1], ['Supervised fine-tuning on human-written answers', 0.5], ['Pre-training on raw web text', 0], ['Shrinking a model so it runs faster', 0]], x: 'Reinforcement Learning from Human Feedback trains a reward model on human rankings, then optimises the LLM against it. Supervised fine-tuning usually comes first.' },
    { q: 'What is the vanishing gradient problem?', d: 3, o: [['Gradients shrink as they flow back through many layers, so early layers barely learn', 1], ['Gradients grow so large that training diverges', 0.25], ['The learning rate is set too low', 0.25], ['The dataset is too small', 0]], x: 'Gradients that grow too large is the opposite problem, exploding gradients. ReLU activations, residual connections and normalisation help with vanishing gradients.' },
    { q: 'What does k-means do?', d: 3, o: [['Groups unlabelled points into k clusters around centroids', 1], ['Classifies a point by the labels of its k nearest neighbours', 0.5], ['Reduces data to k dimensions', 0.25], ['Trains k models and averages them', 0]], x: 'Using the k nearest neighbours’ labels is k-NN, a supervised method. Reducing dimensions is PCA’s job; averaging many models is ensembling.' }
  ]
};

const MIX = { name: 'Full Stack Mix', short: 'Mix', glyph: '✳', tiers: ['Hello World', 'Generalist', 'Polyglot', 'Full-Stack Wizard'] };

/* Bottom-to-top order of the 3D stack on the setup screen */
const STACK_ORDER = ['LINUX', 'NET', 'PY', 'SW', 'WEB', 'AI'];
