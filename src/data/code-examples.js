export default [
  {
    language: 'cpp',
    code: `#include <iostream>
#include <random>

int main() {
    std::mt19937 g{std::random_device{}()};
    std::uniform_real_distribution<> d(0,1);
    int in = 0, N = 1e6;
    for (int i = 0; i < N; ++i) in += d(g)*d(g) < 1;
    std::cout << 4.0 * in / N << '\\n';
}`,
  },
  {
    language: 'cpp',
    code: `#include <iostream>

template<int N> struct F {
  static constexpr int val = F<N-1>::val + F<N-2>::val;
};
template<> struct F<0>{static constexpr int val=0;};
template<> struct F<1>{static constexpr int val=1;};

int main() { std::cout << F<10>::val; }`,
  },
  {
    language: 'haskell',
    code: `fix :: (a -> a) -> a
fix f = let x = f x in x

Y :: (a -> a) -> a
Y f = (\\x -> f (x x)) (\\x -> f (x x))

fibs = 0 : 1 : zipWith (+) fibs (tail fibs)
primes = sieve [2..] where
  sieve (p:xs) = p : sieve [x | x<-xs, mod x p /= 0]`,
  },
  {
    language: 'erlang',
    code: `-module(ring).
-export([start/2]).

start(N, M) ->
    Pids = [spawn(fun() -> node(I) end)
            || I <- lists:seq(1, N)],
    link(Pids),
    hd(Pids) ! {msg, M, self()},
    receive done -> ok end.

link([A,B|T]) -> A ! {next, B}, link([B|T]);
link([Last])  -> Last ! {next, self()}.

node(Id) ->
    receive {next, Pid} ->
        receive
            {msg, 0, Origin} -> Origin ! done;
            {msg, M, Origin} -> Pid ! {msg, M-1, Origin}
        end
    end.`,
  },
  {
    language: 'rust',
    code: `use std::fmt;

enum Tree<T> { Leaf(T), Node(Box<Tree<T>>, Box<Tree<T>>) }

impl<T: fmt::Display> fmt::Display for Tree<T> {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Tree::Leaf(v) => write!(f, "{v}"),
            Tree::Node(l, r) => write!(f, "({l} {r})"),
        }
    }
}

fn depths<T>(t: &Tree<T>, d: usize) -> usize {
    match t {
        Tree::Leaf(_) => d,
        Tree::Node(l, r) => depths(l, d+1).max(depths(r, d+1)),
    }
}`,
  },
  {
    language: 'ocaml',
    code: `type _ expr =
  | Int  : int -> int expr
  | Bool : bool -> bool expr
  | Add  : int expr * int expr -> int expr
  | If   : bool expr * 'a expr * 'a expr -> 'a expr
  | Eq   : int expr * int expr -> bool expr

let rec eval : type a. a expr -> a = function
  | Int n       -> n
  | Bool b      -> b
  | Add (a, b)  -> eval a + eval b
  | If (c, t, e) -> if eval c then eval t else eval e
  | Eq (a, b)   -> eval a = eval b`,
  },
  {
    language: 'coq',
    code: `Fixpoint merge (l1 l2 : list nat) : list nat :=
  match l1, l2 with
  | [], _ => l2
  | _, [] => l1
  | h1::t1, h2::t2 =>
      if h1 <=? h2
      then h1 :: merge t1 l2
      else h2 :: merge l1 t2
  end.

Theorem merge_preserves_length :
  forall l1 l2,
    length (merge l1 l2) = length l1 + length l2.
Proof.
  induction l1; intros; simpl; auto.
  destruct l2; simpl; auto.
  destruct (a <=? n); simpl; auto.
Qed.`,
  },
  {
    language: 'lisp',
    code: `(defmacro aif (test then &optional else)
  \`(let ((it ,test))
     (if it ,then ,else)))

(defun Y (f)
  ((lambda (x) (funcall x x))
   (lambda (x)
     (funcall f (lambda (&rest args)
                  (apply (funcall x x) args))))))

(defvar *fact*
  (Y (lambda (f)
       (lambda (n)
         (if (zerop n) 1
             (* n (funcall f (1- n))))))))`,
  },
];
