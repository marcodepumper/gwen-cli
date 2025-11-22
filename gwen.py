#!/usr/bin/env python3
"""
Gwen CLI - Multi-Agent Cloud Status Monitor

A command-line interface for monitoring cloud service status across
multiple providers using the Gwen agent orchestration system.
"""

import sys
import argparse
import asyncio
from typing import Optional, List
import aiohttp
from datetime import datetime
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich import box

console = Console()

# Backend API base URL
API_BASE = "http://127.0.0.1:8000"


async def fetch_api(endpoint: str, method: str = "GET") -> dict:
    """Fetch data from the backend API."""
    url = f"{API_BASE}{endpoint}"
    
    try:
        async with aiohttp.ClientSession() as session:
            if method == "POST":
                async with session.post(url) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        console.print(f"[red]API Error: {response.status}[/red]")
                        return None
            else:
                async with session.get(url) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        console.print(f"[red]API Error: {response.status}[/red]")
                        return None
    except aiohttp.ClientConnectorError:
        console.print("[red]Error: Cannot connect to backend API[/red]")
        console.print("[yellow]Make sure the backend is running: cd backend && python -m uvicorn main:app[/yellow]")
        return None
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")
        return None


def format_timestamp(iso_str: Optional[str]) -> str:
    """Format ISO timestamp to human-readable format."""
    if not iso_str:
        return "N/A"
    try:
        dt = datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
        return dt.strftime("%Y-%m-%d %H:%M:%S")
    except:
        return iso_str


def get_status_emoji(indicator: str) -> str:
    """Get emoji for status indicator."""
    emojis = {
        "none": "✅",
        "minor": "⚠️",
        "major": "🔴",
        "critical": "🚨",
        "unknown": "❓",
        "error": "❌"
    }
    return emojis.get(indicator, "❓")


async def cmd_status(args):
    """Show current status of all agents or a specific agent."""
    console.print("\n[bold cyan]Gwen Multi-Agent Status Monitor[/bold cyan]\n")
    
    if args.agent:
        # Show specific agent status
        data = await fetch_api(f"/agents/{args.agent}/execute", method="POST")
        if not data:
            return
        
        # Show agent status
        status_emoji = get_status_emoji(data.get("state", "unknown"))
        console.print(f"{status_emoji} [bold]{args.agent}[/bold] - {data.get('state', 'unknown')}")
        
        if data.get("error_message"):
            console.print(f"[red]Error: {data['error_message']}[/red]\n")
            return
        
        # Show execution info
        if data.get("raw_output"):
            output = data["raw_output"]
            
            if "status" in output:
                status = output["status"]
                console.print(f"\n[bold]Overall Status:[/bold] {status.get('description', 'N/A')}")
                console.print(f"[dim]Updated: {format_timestamp(status.get('updated_at'))}[/dim]")
            
            # Show ongoing incidents
            ongoing = output.get("ongoing_incidents", [])
            if ongoing:
                console.print(f"\n[bold red]Ongoing Incidents: {len(ongoing)}[/bold red]")
                for inc in ongoing[:5]:  # Show first 5
                    console.print(f"  • {inc.get('name', 'Unnamed incident')}")
            
            # Show scheduled maintenance
            maintenance = output.get("scheduled_maintenance", [])
            if maintenance:
                console.print(f"\n[bold yellow]Scheduled Maintenance: {len(maintenance)}[/bold yellow]")
                for maint in maintenance[:3]:  # Show first 3
                    in_progress = "🔧 IN PROGRESS" if maint.get("in_progress") else "📅 Upcoming"
                    console.print(f"  {in_progress}: {maint.get('name', 'Unnamed')}")
        
    else:
        # Execute all agents and show summary
        data = await fetch_api("/retrieve-status", method="POST")
        if not data:
            return
        
        # Create status table
        table = Table(title="Cloud Service Status", box=box.ROUNDED)
        table.add_column("Service", style="cyan", no_wrap=True)
        table.add_column("Status", style="green")
        table.add_column("Incidents", justify="right")
        table.add_column("Maintenance", justify="right")
        table.add_column("Last Updated", style="dim")
        
        for agent_summary in data.get("agent_summaries", []):
            agent_name = agent_summary.get("agent_name", "Unknown").replace("Agent", "")
            status = agent_summary.get("status", "unknown")
            
            # Get the actual output data
            output = agent_summary.get("raw_output", {})
            
            # Count incidents and maintenance from actual data
            ongoing_incidents = len(output.get("ongoing_incidents", []))
            recent_incidents = len(output.get("recent_incidents", []))
            total_incidents = ongoing_incidents + recent_incidents
            scheduled_maintenance = len(output.get("scheduled_maintenance", []))
            
            # Determine status indicator from output
            status_indicator = "none"
            if output.get("status"):
                status_indicator = output["status"].get("indicator", "none")
            
            status_emoji = get_status_emoji(status_indicator)
            
            # Format status text
            if ongoing_incidents > 0:
                status_text = f"{status_emoji} {ongoing_incidents} ongoing"
            elif status_indicator == "none":
                status_text = f"{status_emoji} Operational"
            else:
                status_text = f"{status_emoji} {status_indicator}"
            
            table.add_row(
                agent_name,
                status_text,
                str(total_incidents) if total_incidents > 0 else "0",
                str(scheduled_maintenance) if scheduled_maintenance > 0 else "0",
                format_timestamp(agent_summary.get("end_time"))
            )
        
        console.print(table)
        console.print(f"\n[dim]Execution ID: {data.get('execution_id')}[/dim]")
        console.print(f"[dim]Duration: {data.get('total_duration', 0):.2f}s[/dim]")


async def cmd_incidents(args):
    """Show incidents for all agents or a specific agent."""
    console.print("\n[bold cyan]Cloud Service Incidents[/bold cyan]\n")
    
    # Execute agents to get latest data
    if args.agent:
        data = await fetch_api(f"/agents/{args.agent}/execute", method="POST")
        if not data or not data.get("raw_output"):
            return
        
        agents_data = {args.agent: data["raw_output"]}
    else:
        result = await fetch_api("/retrieve-status", method="POST")
        if not result:
            return
        
        # Get detailed data for each agent
        agents_data = {}
        for agent_summary in result.get("agent_summaries", []):
            agent_name = agent_summary.get("agent_name")
            if agent_summary.get("raw_output"):
                agents_data[agent_name] = agent_summary["raw_output"]
    
    # Display incidents
    for agent_name, output in agents_data.items():
        service_name = agent_name.replace("Agent", "")
        
        ongoing = output.get("ongoing_incidents", [])
        recent = output.get("recent_incidents", [])
        
        if not ongoing and not recent:
            continue
        
        console.print(f"\n[bold]{service_name}[/bold]")
        console.print("─" * 60)
        
        if ongoing:
            console.print(f"\n[red]● Ongoing ({len(ongoing)}):[/red]")
            for inc in ongoing:
                console.print(f"  [bold]{inc.get('name', 'Unnamed')}[/bold]")
                console.print(f"  Impact: {inc.get('impact', 'unknown')} | Status: {inc.get('status', 'unknown')}")
                console.print(f"  Created: {format_timestamp(inc.get('created_at'))}")
                if inc.get('components'):
                    console.print(f"  Components: {', '.join(inc['components'][:3])}")
                if inc.get('shortlink'):
                    console.print(f"  Link: {inc['shortlink']}")
                console.print()
        
        if args.show_recent and recent:
            console.print(f"\n[yellow]○ Recent (last {args.days} days - {len(recent)}):[/yellow]")
            for inc in recent[:5]:  # Show first 5
                console.print(f"  {inc.get('name', 'Unnamed')}")
                console.print(f"  Resolved: {format_timestamp(inc.get('resolved_at'))}")
                console.print()


async def cmd_maintenance(args):
    """Show scheduled maintenance for all agents or a specific agent."""
    console.print("\n[bold cyan]Scheduled Maintenance[/bold cyan]\n")
    
    # Execute agents to get latest data
    if args.agent:
        data = await fetch_api(f"/agents/{args.agent}/execute", method="POST")
        if not data or not data.get("raw_output"):
            return
        
        agents_data = {args.agent: data["raw_output"]}
    else:
        result = await fetch_api("/retrieve-status", method="POST")
        if not result:
            return
        
        # Get detailed data for each agent
        agents_data = {}
        for agent_summary in result.get("agent_summaries", []):
            agent_name = agent_summary.get("agent_name")
            if agent_summary.get("raw_output"):
                agents_data[agent_name] = agent_summary["raw_output"]
    
    # Display maintenance
    found_any = False
    for agent_name, output in agents_data.items():
        service_name = agent_name.replace("Agent", "")
        maintenance = output.get("scheduled_maintenance", [])
        
        if not maintenance:
            continue
        
        found_any = True
        console.print(f"\n[bold]{service_name}[/bold]")
        console.print("─" * 60)
        
        for maint in maintenance:
            in_progress = maint.get("in_progress", False)
            status_icon = "🔧" if in_progress else "📅"
            status_text = "[red]IN PROGRESS[/red]" if in_progress else "[yellow]Scheduled[/yellow]"
            
            console.print(f"\n{status_icon} {status_text}")
            console.print(f"[bold]{maint.get('name', 'Unnamed maintenance')}[/bold]")
            console.print(f"Start: {format_timestamp(maint.get('scheduled_for'))}")
            console.print(f"End: {format_timestamp(maint.get('scheduled_until'))}")
            if maint.get('components'):
                console.print(f"Components: {', '.join(maint['components'][:3])}")
            if maint.get('shortlink'):
                console.print(f"Link: {maint['shortlink']}")
    
    if not found_any:
        console.print("[green]No scheduled maintenance found[/green]")


async def cmd_list_agents(args):
    """List all available agents."""
    console.print("\n[bold cyan]Available Agents[/bold cyan]\n")
    
    data = await fetch_api("/agents")
    if not data:
        console.print("[yellow]Tip: Make sure the backend is running:[/yellow]")
        console.print("[dim]cd backend && python -m uvicorn main:app --port 8000[/dim]")
        return
    
    table = Table(box=box.ROUNDED)
    table.add_column("Agent", style="cyan")
    table.add_column("Type", style="green")
    table.add_column("Status", style="yellow")
    table.add_column("Description")
    
    for agent in data.get("agents", []):
        table.add_row(
            agent.get("name", "Unknown"),
            agent.get("type", "Unknown"),
            agent.get("status", "idle"),
            agent.get("description", "N/A")
        )
    
    console.print(table)
    console.print(f"\n[dim]Total agents: {data.get('total', 0)}[/dim]")


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Gwen - Multi-Agent Cloud Status Monitor",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Status command
    status_parser = subparsers.add_parser("status", help="Show current status of cloud services")
    status_parser.add_argument("agent", nargs="?", help="Specific agent name (e.g., CloudflareAgent)")
    
    # Incidents command
    incidents_parser = subparsers.add_parser("incidents", help="Show incidents")
    incidents_parser.add_argument("agent", nargs="?", help="Specific agent name")
    incidents_parser.add_argument("--days", type=int, default=14, help="Number of days to look back (default: 14)")
    incidents_parser.add_argument("--show-recent", action="store_true", help="Show recent resolved incidents")
    
    # Maintenance command
    maintenance_parser = subparsers.add_parser("maintenance", help="Show scheduled maintenance")
    maintenance_parser.add_argument("agent", nargs="?", help="Specific agent name")
    
    # List agents command
    list_parser = subparsers.add_parser("list-agents", help="List all available agents")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    # Execute command
    if args.command == "status":
        asyncio.run(cmd_status(args))
    elif args.command == "incidents":
        asyncio.run(cmd_incidents(args))
    elif args.command == "maintenance":
        asyncio.run(cmd_maintenance(args))
    elif args.command == "list-agents":
        asyncio.run(cmd_list_agents(args))


if __name__ == "__main__":
    main()
