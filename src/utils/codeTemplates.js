/**
 * Code Templates for different programming languages
 */

export const CODE_TEMPLATES = {
  cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    // Write your solution here
    void solve() {
        // Your code goes here
    }
};

int main() {
    Solution sol;
    sol.solve();
    return 0;
}`,

  java: `import java.util.*;

public class Solution {
    // Write your solution here
    public void solve() {
        // Your code goes here
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        sol.solve();
    }
}`,

  python: `class Solution:
    def solve(self):
        # Write your solution here
        # Your code goes here
        pass

if __name__ == "__main__":
    sol = Solution()
    sol.solve()`,

  csharp: `using System;
using System.Collections.Generic;

public class Solution {
    // Write your solution here
    public void Solve() {
        // Your code goes here
    }
    
    public static void Main(string[] args) {
        Solution sol = new Solution();
        sol.Solve();
    }
}`
};

export const LANGUAGE_NAMES = {
  cpp: 'C++',
  java: 'Java',
  python: 'Python',
  csharp: 'C#'
};

