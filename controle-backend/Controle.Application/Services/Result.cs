using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Controle.Application.Services
{
    public class Result
    {
        public bool Success { get; }
        public string? Error { get; }

        protected Result(bool success, string? error)
        {
            Success = success;
            Error = error;
        }

        public static Result Ok() => new(true, null);
        public static Result Fail(string error) => new(false, error);
    }

}